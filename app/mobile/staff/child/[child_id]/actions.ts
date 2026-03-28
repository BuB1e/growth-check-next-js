"use server";

import { ChildAction } from "@/actions/ChildAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import { DevelopmentAction } from "@/actions/DevelopmentAction";
import type { CreateChildDataDTO } from "@/dto";
import { Metric_type } from "@/types";

import { getCurrentUserId } from "@/lib/auth/auth-guard";

export async function createChildDataAction(
  data: CreateChildDataDTO,
) {
  const resolvedUserId = await getCurrentUserId();

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
    resolvedHeightDevelopmentId <= 0 ||
    resolvedWeightDevelopmentId <= 0
  ) {
    throw new Error(
      "Missing reference IDs (location/development). Seed developments and child data first.",
    );
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

  return created;
}

export async function createPredictionForChildAction(
  childId: number,
  model: "lstm" = "lstm",
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

    const latest = [...history].sort(
      (a, b) => new Date(b.heightDate).getTime() - new Date(a.heightDate).getTime(),
    )[0];

    if (!latest || !latest.heightDevelopmentId || !latest.weightDevelopmentId) {
      return {
        success: false,
        error: "ไม่พบข้อมูลเกณฑ์พัฒนาการสำหรับการทำนาย",
      };
    }

    await ChildAction.predictChild(childId.toString(), model);

    return {
      success: true,
      data: {
        queuedAt: Date.now(),
        model,
        message: "Prediction request sent successfully",
      },
    };
  } catch (error) {
    console.error("Failed to create prediction:", error);
    return {
      success: false,
      error: "ไม่สามารถทำนายการเจริญเติบโตได้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}
