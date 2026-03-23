"use server";

import { UserAction } from "@/actions/UserAction";
import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import { UpdateUserDto } from "@/dto";

/**
 * Server action to complete user profile and create registration status.
 * This is called from the client-side RegisterForm to avoid env variable leaks.
 */
export async function completeRegistrationAction(
  userId: string,
  userData: UpdateUserDto
) {
  try {
    // 1. Update User Profile (teamId, firstName, lastName)
    await UserAction.updateUser(userId, userData);

    // 2. Create UserCreateStatus (WAITING status)
    const status = await UserCreateStatusAction.createStatus({
      userId,
    });

    console.log(`[completeRegistrationAction] Completed for user ${userId}, status created: ${status.id}`);
    return { success: true, statusId: status.id };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[completeRegistrationAction] Error:", error);
    return { 
      success: false, 
      error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลกรุณาลองใหม่อีกครั้ง" 
    };
  }
}
