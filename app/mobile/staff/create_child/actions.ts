"use server";

import { z } from "zod";
import { ChildAction } from "@/actions/ChildAction";
import { LocationAction } from "@/actions/LocationAction";
import { EnvConfig } from "@/configs/BackendConfig";
import { redirect } from "next/navigation";

// Utility to pad and clamp day/month
function normalizeDay(day: string | FormDataEntryValue | null): string {
  let n = parseInt(String(day ?? ""), 10);
  if (isNaN(n) || n < 1) n = 1;
  if (n > 31) n = 31;
  return n.toString().padStart(2, "0");
}
function normalizeMonth(month: string | FormDataEntryValue | null): string {
  let n = parseInt(String(month ?? ""), 10);
  if (isNaN(n) || n < 1) n = 1;
  if (n > 12) n = 12;
  return n.toString().padStart(2, "0");
}

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

export async function getCreateChildLocationOptions() {
  const response = await LocationAction.getLocations({
    page: 1,
    limit: 500,
    deleted: false,
  });

  return response.data.map((location) => ({
    id: location.id,
    name: location.name,
    district: location.district,
    province: location.province,
  }));
}

export async function createChildServerAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {

  // Normalize day/month before validation
  const rawDay = formData.get("birthDateDay");
  const rawMonth = formData.get("birthDateMonth");
  const normalizedDay = normalizeDay(rawDay);
  const normalizedMonth = normalizeMonth(rawMonth);


  // Validate fields
  const validatedFields = createChildSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDateDay: normalizedDay,
    birthDateMonth: normalizedMonth,
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

  // Compare only date (year, month, day) to avoid timezone issues
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth() + 1; // getMonth() is 0-based
  const todayD = now.getDate();
  const birthY = birthDate.getFullYear();
  const birthM = birthDate.getMonth() + 1;
  const birthD = birthDate.getDate();

  // If birth date is after today (compare Y, M, D)
  if (
    birthY > todayY ||
    (birthY === todayY && birthM > todayM) ||
    (birthY === todayY && birthM === todayM && birthD > todayD)
  ) {
    return {
      errors: {
        birthDateDay: ["วันเกิดต้องไม่เป็นวันที่ในอนาคต"],
      },
      message: "วันเกิดต้องไม่มากกว่าวันปัจจุบัน",
      success: false,
    };
  }

  try {
    const resolvedUserId = EnvConfig.MOCK_USER_ID ?? "current-user";

    await ChildAction.createChild({
      firstName,
      lastName,
      sex: "MALE", // TODO: Add sex field to UI form
      birthDate,
      locationId: parseInt(locationId),
      // TODO: Replace with actual user ID from authenticated session.
      createdByUser: resolvedUserId,
      updatedByUser: resolvedUserId,
    });
  } catch (error) {
    console.error("[createChildServerAction] Failed to create child:", error);
    return {
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่",
      success: false,
    };
  }

  // Redirect runs outside try-catch to work correctly in Next.js
  redirect("/mobile/staff/home");
}
