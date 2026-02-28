"use server";

import { z } from "zod";
import { ChildAction } from "@/actions/ChildAction";
import { redirect } from "next/navigation";

const createChildSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อจริง"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  birthDateDay: z.string().length(2, "ระบุวัน (01-31)"),
  birthDateMonth: z.string().length(2, "ระบุเดือน (01-12)"),
  birthDateYear: z.string().length(4, "ระบุปี พ.ศ. (4 หลัก)"),
  weight: z.string().min(1, "กรุณากรอกน้ำหนัก"),
  height: z.string().min(1, "กรุณากรอกส่วนสูง"),
  locationId: z.string().min(1, "กรุณาเลือกศูนย์พัฒนาเด็กเล็ก"),
});

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string | null;
  success?: boolean;
};

export async function createChildServerAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  // Validate fields
  const validatedFields = createChildSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDateDay: formData.get("birthDateDay"),
    birthDateMonth: formData.get("birthDateMonth"),
    birthDateYear: formData.get("birthDateYear"),
    weight: formData.get("weight"),
    height: formData.get("height"),
    locationId: formData.get("locationId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
      success: false,
    };
  }

  const {
    firstName,
    lastName,
    birthDateDay,
    birthDateMonth,
    birthDateYear,
    weight,
    height,
    locationId,
  } = validatedFields.data;

  // Convert BE year to AD year for Date parsing
  const adYear = parseInt(birthDateYear) - 543;
  const dateStr = `${adYear}-${birthDateMonth}-${birthDateDay}`;
  const birthDate = new Date(dateStr);

  if (isNaN(birthDate.getTime())) {
    return {
      errors: {
        birthDateDay: ["วันที่ไม่ถูกต้อง"],
      },
      message: "วันที่ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
      success: false,
    };
  }

  try {
    await ChildAction.createChild({
      firstName,
      lastName,
      birthDate,
      locationId: parseInt(locationId),
      weight: parseFloat(weight),
      height: parseFloat(height),
    });
  } catch (error) {
    console.error("Failed to create child:", error);
    return {
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่",
      success: false,
    };
  }

  // Redirect runs outside try-catch to work correctly in Next.js
  redirect("/staff/home");
}
