"use server";

import { AiPredictionAction } from "@/actions/AiPredictionAction";
import { ChildAction } from "@/actions/ChildAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import { DevelopmentAction } from "@/actions/DevelopmentAction";
import { EnvConfig } from "@/configs/BackendConfig";
import { revalidatePath } from "next/cache";
import type { AiPredictionResponse, CreateChildDataDTO, UpdateChildDTO } from "@/dto";
import { Metric_type } from "@/types";

export type PredictionModel = "lstm";

type BaselineSignatures = Record<string, string>;

const toSafeIsoString = (value: unknown): string => {
  const date = new Date(value as string | number | Date);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
};

const buildPredictionSignature = (item: AiPredictionResponse): string => {
  return JSON.stringify({
    modelUsed: item.modelUsed,
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
  data: UpdateChildDTO,
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

export async function createChildDataAction(data: CreateChildDataDTO) {
  try {
    const { getCurrentUserId } = await import("@/lib/auth/auth-guard");
    const resolvedUserId = await getCurrentUserId();

    if (!resolvedUserId) {
      return {
        success: false,
        error: "ไม่พบผู้ใช้สำหรับบันทึกข้อมูล กรุณาเข้าสู่ระบบ",
      };
    }

    const latestRecords = await ChildDataAction.getChildDataList({
      childId: data.childId,
      page: 1,
      limit: 100,
    });

    const latestWithDev = [...latestRecords]
      .sort(
        (a, b) =>
          new Date(b.heightDate).getTime() - new Date(a.heightDate).getTime(),
      )
      .find((item) => item.heightDevelopmentId > 0 && item.weightDevelopmentId > 0);

    const [heightDevRes, weightDevRes] = await Promise.all([
      DevelopmentAction.getDevelopments({
        metric: Metric_type.HA,
        deleteStatus: false,
        page: 1,
        limit: 1,
      }),
      DevelopmentAction.getDevelopments({
        metric: Metric_type.WA,
        deleteStatus: false,
        page: 1,
        limit: 1,
      }),
    ]);

    const fallbackHeightDevId = heightDevRes.data[0]?.id;
    const fallbackWeightDevId = weightDevRes.data[0]?.id;

    const child = await ChildAction.getChildById(data.childId.toString());

    const resolvedLocationId =
      data.locationId > 0 ? data.locationId : (child?.locationId ?? 0);
    const resolvedHeightDevelopmentId =
      data.heightDevelopmentId && data.heightDevelopmentId > 0
        ? data.heightDevelopmentId
        : (latestWithDev?.heightDevelopmentId ?? fallbackHeightDevId ?? 0);
    const resolvedWeightDevelopmentId =
      data.weightDevelopmentId && data.weightDevelopmentId > 0
        ? data.weightDevelopmentId
        : (latestWithDev?.weightDevelopmentId ?? fallbackWeightDevId ?? 0);

    if (
      resolvedLocationId <= 0 ||
      !resolvedHeightDevelopmentId ||
      resolvedHeightDevelopmentId <= 0 ||
      !resolvedWeightDevelopmentId ||
      resolvedWeightDevelopmentId <= 0
    ) {
      return {
        success: false,
        error:
          "ข้อมูลอ้างอิงไม่ครบสำหรับบันทึก (location/development) กรุณา seed ตาราง developments และข้อมูลเด็กให้ครบ",
      };
    }

    const payload: CreateChildDataDTO = {
      ...data,
      locationId: resolvedLocationId,
      heightDevelopmentId: resolvedHeightDevelopmentId,
      weightDevelopmentId: resolvedWeightDevelopmentId,
      userCreated: resolvedUserId,
      userUpdated: resolvedUserId,
      ageYear: data.ageYear,
      ageMonth: data.ageMonth,
    };

    const created = await ChildDataAction.createChildData(payload);

    // Trigger auto AI prediction if history exists
    try {
      if (latestRecords.length + 1 >= 3) {
        await ChildAction.predictChild(data.childId.toString(), "lstm");
      }
    } catch (err) {
      console.warn("Auto-prediction trigger failed (non-critical):", err);
    }

    revalidatePath(`/children/${data.childId}`);
    revalidatePath(`/desktop/children/${data.childId}`);
    revalidatePath(`/mobile/staff/${data.childId}`);

    return {
      success: true,
      data: created,
    };
  } catch (error) {
    console.error("Failed to create child data:", error);
    return {
      success: false,
      error: "ไม่สามารถบันทึกข้อมูลการวัดได้ กรุณาลองใหม่อีกครั้ง",
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

    // OPTIMIZATION: Check if the prediction finished synchronously
    const immediateCheck = await AiPredictionAction.getPredictions({
      childId,
      page: 1,
      limit: 10,
    });

    const baselineSet = new Set<number>(baselineIds);
    const newPrediction = immediateCheck.data.find((item) => {
      const isNewId = !baselineSet.has(item.id);
      const isFresh = new Date(item.createdAt).getTime() >= queuedAt - 2000;
      return isNewId && isFresh;
    });

    if (newPrediction) {
      revalidatePath(`/desktop/children/${childId}`);
      revalidatePath(`/mobile/staff/child/${childId}`);
      
      return {
        success: true,
        status: "ready" as const,
        data: newPrediction,
      };
    }

    return {
      success: true,
      status: "polling" as const,
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

    const buildCandidateScore = (
      item: AiPredictionResponse,
      baselineSet: Set<number>,
    ) => {
      const isNewId = !baselineSet.has(item.id);
      const previousSignature = baselineSignatures?.[String(item.id)];
      const currentSignature = buildPredictionSignature(item);
      const isUpdatedInPlace =
        typeof previousSignature === "string" && previousSignature !== currentSignature;

      const t = new Date(item.createdAt).getTime();
      // Increase tolerance for backend clock drift and latencies (2 minutes window)
      const isFreshEnough = t >= queuedAt - 120_000;

      return {
        isNewId,
        isUpdatedInPlace,
        isFreshEnough,
      };
    };

    const response = await AiPredictionAction.getPredictions({
      childId,
      page: 1,
      limit: 100,
    });

    const baselineSet = new Set<number>(baselineIds);

    const candidates = response.data.filter((item) => {
      const score = buildCandidateScore(item, baselineSet);
      // Some backends may update an existing prediction row instead of inserting a new ID.
      return score.isNewId || score.isUpdatedInPlace || score.isFreshEnough;
    });

    // Fallback: some backends may return paginated lists that miss the newest row,
    // so also inspect the dedicated latest endpoint before deciding to stay pending.
    const latestCandidate = await AiPredictionAction.getLatestPredictionByChildId(childId);
    if (latestCandidate) {
      const score = buildCandidateScore(latestCandidate, baselineSet);
      const isCandidate =
        score.isNewId || score.isUpdatedInPlace || score.isFreshEnough;
      if (isCandidate && !candidates.some((item) => item.id === latestCandidate.id)) {
        candidates.push(latestCandidate);
      }
    }

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
    revalidatePath(`/mobile/staff/child/${childId}`);

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
