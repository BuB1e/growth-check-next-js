"use server";

import { ChildAction } from "@/actions/ChildAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import { DevelopmentAction } from "@/actions/DevelopmentAction";
import { EnvConfig } from "@/configs/BackendConfig";
import type { CreateChildDataDTO } from "@/dto";

export async function createChildDataAction(
  data: CreateChildDataDTO,
) {
  // TODO: Remove MOCK_USER_ID fallback when real authenticated user session is available.
  const resolvedUserId =
    EnvConfig.MOCK_USER_ID ?? data.userCreated ?? data.userUpdated;

  if (!resolvedUserId) {
    throw new Error("Missing MOCK_USER_ID in .env for development mode");
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
      metric: "HA",
      deleteStatus: false,
      page: 1,
      limit: 1,
    }),
    DevelopmentAction.getDevelopments({
      metric: "WA",
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
    data.heightDevelopmentId > 0
      ? data.heightDevelopmentId
      : (latestWithDev?.heightDevelopmentId ?? fallbackHeightDevId ?? 0);
  const resolvedWeightDevelopmentId =
    data.weightDevelopmentId > 0
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
  };

  return await ChildDataAction.createChildData(payload);
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
