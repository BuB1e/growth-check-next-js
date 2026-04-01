"use server";

import { UserAction } from "@/actions/UserAction";
import { Role } from "@/types";
import { revalidatePath } from "next/cache";
import type { UpdateUserDto } from "@/dto";

/**
 * Server action to update a user's role.
 * This is restricted to ADMIN users on the UI level, and the backend 
 * should also have its own checks.
 */
export async function updateStaffRoleAction(userId: string, newRole: Role) {
  try {
    const payload: UpdateUserDto = { role: newRole };
    await UserAction.updateUser(userId, payload);
    
    // Revalidate paths to ensure UI is up to date
    revalidatePath("/desktop/staff");
    revalidatePath(`/desktop/staff/${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update staff role:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการปรับเปลี่ยนสิทธิ์" 
    };
  }
}
