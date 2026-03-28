"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { GrowthReferenceAction } from "@/actions/GrowthReferenceAction";
import { Sex, Metric_type } from "@/types";

export type GrowthReferenceActionState = {
  errors?: Record<string, string[]>;
  message?: string | null;
  success?: boolean;
};

const growthReferenceSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  sex: z.nativeEnum(Sex, { message: "กรุณาเลือกเพศ" }),
  metric: z.nativeEnum(Metric_type, { message: "กรุณาเลือกประเภท metric" }),
  minAge: z.coerce.number().min(0, "อายุต่ำสุดต้องไม่ติดลบ"),
  maxAge: z.coerce.number().min(0, "อายุสูงสุดต้องไม่ติดลบ"),
  weightMean: z.coerce.number().min(0, "ค่าเฉลี่ยน้ำหนักต้องไม่ติดลบ"),
  weightSd: z.coerce.number().min(0, "SD น้ำหนักต้องไม่ติดลบ"),
  heightMean: z.coerce.number().min(0, "ค่าเฉลี่ยส่วนสูงต้องไม่ติดลบ"),
  heightSd: z.coerce.number().min(0, "SD ส่วนสูงต้องไม่ติดลบ"),
  // TODO: bmiMean/bmiSd are sent to backend but not returned in GET response yet
  bmiMean: z.coerce.number().min(0).optional(),
  bmiSd: z.coerce.number().min(0).optional(),
});

export async function createGrowthReferenceAction(
  prevState: GrowthReferenceActionState | null,
  formData: FormData,
): Promise<GrowthReferenceActionState> {
  const validatedFields = growthReferenceSchema.safeParse({
    name: formData.get("name"),
    sex: formData.get("sex"),
    metric: formData.get("metric"),
    minAge: formData.get("minAge"),
    maxAge: formData.get("maxAge"),
    weightMean: formData.get("weightMean"),
    weightSd: formData.get("weightSd"),
    heightMean: formData.get("heightMean"),
    heightSd: formData.get("heightSd"),
    bmiMean: formData.get("bmiMean") || undefined,
    bmiSd: formData.get("bmiSd") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
      success: false,
    };
  }

  if (validatedFields.data.minAge >= validatedFields.data.maxAge) {
    return {
      errors: { minAge: ["อายุต่ำสุดต้องน้อยกว่าอายุสูงสุด"] },
      message: "ช่วงอายุไม่ถูกต้อง",
      success: false,
    };
  }

  try {
    await GrowthReferenceAction.createGrowthReference(validatedFields.data);
    revalidatePath("/desktop/growth-references");
  } catch (error) {
    console.error("[createGrowthReferenceAction] Failed:", error);
    return {
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่",
      success: false,
    };
  }

  // redirect must run outside try-catch
  redirect("/desktop/growth-references");
}

export async function updateGrowthReferenceAction(
  id: string,
  data: {
    name?: string;
    weightMean?: number;
    weightSd?: number;
    heightMean?: number;
    heightSd?: number;
    bmiMean?: number;
    bmiSd?: number;
    minAge?: number;
    maxAge?: number;
  },
): Promise<GrowthReferenceActionState> {
  try {
    await GrowthReferenceAction.updateGrowthReference(id, data);
    revalidatePath(`/desktop/growth-references/${id}`);
    revalidatePath("/desktop/growth-references");
    return { success: true, message: "อัพเดทข้อมูลเรียบร้อยแล้ว" };
  } catch (error) {
    console.error("[updateGrowthReferenceAction] Failed:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล กรุณาลองใหม่",
    };
  }
}

export async function deleteGrowthReferenceAction(
  id: string,
): Promise<GrowthReferenceActionState> {
  try {
    await GrowthReferenceAction.deleteGrowthReference(id);
    revalidatePath("/desktop/growth-references");
    return { success: true, message: "ลบข้อมูลเรียบร้อยแล้ว" };
  } catch (error) {
    console.error("[deleteGrowthReferenceAction] Failed:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่",
    };
  }
}
