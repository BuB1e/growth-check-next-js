"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { DevelopmentAction } from "@/actions/DevelopmentAction";

export type UpdateDevelopmentSuggestionState = {
  errors?: Record<string, string[]>;
  message?: string | null;
  success?: boolean;
};

// Validate just the suggestion field
const suggestionSchema = z.object({
  id: z.coerce.number().min(1, "ID is required"),
  suggestion: z.string().min(1, "คำแนะนำไม่ควรว่างเปล่า"),
});

export async function updateDevelopmentSuggestionAction(
  id: string,
  suggestion: string,
): Promise<UpdateDevelopmentSuggestionState> {
  const validatedFields = suggestionSchema.safeParse({ id, suggestion });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "ข้อมูลไม่ถูกต้อง",
      success: false,
    };
  }

  try {
    await DevelopmentAction.updateDevelopment(id, { suggestion });
    // Revalidate the development list page so the UI stays fresh if reloaded
    revalidatePath("/desktop/development");
    return { success: true, message: "บันทึกเรียบร้อย" };
  } catch (error) {
    console.error("[updateDevelopmentSuggestionAction] Failed to update suggestion:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่",
    };
  }
}
