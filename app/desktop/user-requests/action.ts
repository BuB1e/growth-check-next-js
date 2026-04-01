"use server";

import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import { Request_status } from "@/types";
import { revalidatePath } from "next/cache";
import type { UpdateUserCreateStatusDto } from "@/dto";

/**
 * Update a single user request status.
 */
export async function updateUserRequestStatusAction(
  id: string,
  data: UpdateUserCreateStatusDto
) {
  try {
    console.log(`[updateUserRequestStatusAction] Updating request ${id}:`, data);
    await UserCreateStatusAction.updateStatus(id.toString(), data);
    
    revalidatePath("/desktop/user-requests");
    revalidatePath("/desktop/staff");
    revalidatePath(`/desktop/user-requests/${id}`);
    
    return { success: true };
  } catch (error: unknown) {
    console.error(`[updateUserRequestStatusAction] Error updating request ${id}:`, error);
    let errorMessage = "เกิดข้อผิดพลาดในการอัปเดตสถานะ";
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      errorMessage = axiosError.response?.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Bulk update user request statuses.
 */
export async function bulkUpdateUserRequestStatusAction(
  ids: string[],
  status: Request_status
) {
  try {
    console.log(`[bulkUpdateUserRequestStatusAction] Bulk updating ${ids.length} requests to ${status}`);
    
    // Process in parallel on the server
    const results = await Promise.allSettled(
      ids.map((id) => {
        const payload: UpdateUserCreateStatusDto = { requestStatus: status };
        return UserCreateStatusAction.updateStatus(id.toString(), payload);
      })
    );
    
    const failures = results.filter(r => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`[bulkUpdateUserRequestStatusAction] ${failures.length} updates failed`);
    }

    revalidatePath("/desktop/user-requests");
    revalidatePath("/desktop/staff");
    
    return { 
      success: failures.length === 0, 
      total: ids.length,
      failedCount: failures.length 
    };
  } catch (error: unknown) {
    console.error(`[bulkUpdateUserRequestStatusAction] Unexpected error:`, error);
    let errorMessage = "เกิดข้อผิดพลาดในการอัปเดตสถานะแบบกลุ่ม";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}
