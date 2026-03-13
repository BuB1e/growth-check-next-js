"use server";

import { ChildAction } from "@/actions/ChildAction";
import { revalidatePath } from "next/cache";


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
