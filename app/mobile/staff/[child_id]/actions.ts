"use server";

import { ChildAction } from "@/actions/ChildAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import type { CreateChildDataDTO } from "@/dto";

export async function createChildDataAction(
  data: CreateChildDataDTO,
) {
  return await ChildDataAction.createChildData(data);
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
