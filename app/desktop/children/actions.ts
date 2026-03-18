"use server";

import { AiPredictionAction } from "@/actions/AiPredictionAction";
import { ChildAction } from "@/actions/ChildAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import { EnvConfig } from "@/configs/BackendConfig";
import { revalidatePath } from "next/cache";
import type { AiPredictionResponse } from "@/dto";

export type PredictionModel = "lstm";

type BaselineSignatures = Record<string, string>;

const toSafeIsoString = (value: unknown): string => {
  const date = new Date(value as string | number | Date);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
};

const buildPredictionSignature = (item: AiPredictionResponse): string => {
  return JSON.stringify({
    modelUsed: item.modelUsed,
    modelVersion: item.modelVersion,
    month: item.month,
    dateTime: toSafeIsoString(item.dateTime),
    createdAt: toSafeIsoString(item.createdAt),
    height: item.height,
    weight: item.weight,
  });
};

const getPollingPolicy = () => {
  return {
    initialMs: EnvConfig.AI_PREDICTION_POLL_INITIAL_MS,
    backoffFactor: EnvConfig.AI_PREDICTION_POLL_BACKOFF_FACTOR,
    maxMs: EnvConfig.AI_PREDICTION_POLL_MAX_MS,
    timeoutMs: EnvConfig.AI_PREDICTION_POLL_TIMEOUT_MS,
    hiddenMinMs: EnvConfig.AI_PREDICTION_POLL_HIDDEN_MIN_MS,
    jitterRatio: EnvConfig.AI_PREDICTION_POLL_JITTER_RATIO,
  };
};


export async function updateChildAction(
  childId: number,
  data: {
    firstName: string;
    lastName: string;
    locationId: number;
  },
) {
  try {
    await ChildAction.updateChild(childId.toString(), data);
    // Revalidate the shared children detail page path
    revalidatePath(`/children/${childId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update child:", error);
    return {
      success: false,
      error: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function createChildPredictionAction(childId: number) {
  return createChildPredictionQueueAction(childId, "lstm");
}

export async function createChildPredictionQueueAction(
  childId: number,
  model: PredictionModel,
) {
  try {
    const history = await ChildDataAction.getChildDataList({
      childId,
      page: 1,
      limit: 100,
    });

    if (history.length < 3) {
      return {
        success: false,
        error: "ต้องมีข้อมูลวัดอย่างน้อย 3 ครั้งก่อนเริ่มการทำนาย",
      };
    }

    const baseline = await AiPredictionAction.getPredictions({
      childId,
      page: 1,
      limit: 100,
    });

    const baselineIds = baseline.data.map((item) => item.id);
    const baselineSignatures: BaselineSignatures = Object.fromEntries(
      baseline.data.map((item) => [String(item.id), buildPredictionSignature(item)]),
    );
    const queuedAt = Date.now();

    await ChildAction.predictChild(childId.toString(), model);

    return {
      success: true,
      data: {
        queuedAt,
        baselineIds,
        baselineSignatures,
        model,
        poll: {
          ...getPollingPolicy(),
        },
      },
    };
  } catch (error) {
    console.error("Failed to queue child prediction:", error);

    return {
      success: false,
      error: "ไม่สามารถส่งคำขอทำนายได้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function pollChildPredictionAction({
  childId,
  queuedAt,
  baselineIds,
  baselineSignatures,
  previousDelayMs,
}: {
  childId: number;
  queuedAt: number;
  baselineIds: number[];
  baselineSignatures?: BaselineSignatures;
  previousDelayMs?: number;
}) {
  try {
    const policy = getPollingPolicy();

    const response = await AiPredictionAction.getPredictions({
      childId,
      page: 1,
      limit: 100,
    });

    const baselineSet = new Set<number>(baselineIds);

    const candidates = response.data.filter((item) => {
      const isNewId = !baselineSet.has(item.id);
      const previousSignature = baselineSignatures?.[String(item.id)];
      const currentSignature = buildPredictionSignature(item);
      const isUpdatedInPlace =
        typeof previousSignature === "string" && previousSignature !== currentSignature;

      const t = new Date(item.createdAt).getTime();
      const isFreshEnough = t >= queuedAt - 5_000;

      // Some backends may update an existing prediction row instead of inserting a new ID.
      return isNewId || isUpdatedInPlace || isFreshEnough;
    });

    if (!candidates.length) {
      const baseDelay =
        typeof previousDelayMs === "number" && previousDelayMs > 0
          ? previousDelayMs
          : policy.initialMs;
      const nextDelayMs = Math.min(
        policy.maxMs,
        Math.round(baseDelay * policy.backoffFactor),
      );

      return {
        success: true,
        status: "pending" as const,
        poll: {
          nextDelayMs,
          hiddenMinMs: policy.hiddenMinMs,
          jitterRatio: policy.jitterRatio,
          timeoutMs: policy.timeoutMs,
        },
      };
    }

    const latest = [...candidates].sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      if (bt !== at) return bt - at;
      return b.id - a.id;
    })[0] as AiPredictionResponse;

    revalidatePath(`/desktop/children/${childId}`);
    revalidatePath(`/mobile/staff/child_${childId}`);

    return {
      success: true,
      status: "ready" as const,
      data: latest,
    };
  } catch (error) {
    console.error("Failed to poll child prediction:", error);

    return {
      success: false,
      status: "error" as const,
      error: "ไม่สามารถตรวจสอบสถานะการทำนายได้",
    };
  }
}
