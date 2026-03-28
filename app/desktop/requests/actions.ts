"use server";

import { revalidatePath } from "next/cache";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import { ChildTransferRequestAction } from "@/actions/ChildTransferRequestAction";
import { Request_status } from "@/types";

export async function approveLocationRequestAction(id: number, handlerId: string) {
  try {
    await LocationCreateRequestAction.updateRequest(id, {
      status: Request_status.APPROVE,
      handledBy: handlerId
    });
    revalidatePath(`/desktop/requests/location/${id}`);
    revalidatePath("/desktop/requests");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve location request:", error);
    return { success: false, error: "ไม่สามารถอนุมัติได้" };
  }
}

export async function rejectLocationRequestAction(id: number, handlerId: string) {
  try {
    await LocationCreateRequestAction.updateRequest(id, {
      status: Request_status.REJECT,
      handledBy: handlerId
    });
    revalidatePath(`/desktop/requests/location/${id}`);
    revalidatePath("/desktop/requests");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject location request:", error);
    return { success: false, error: "ไม่สามารถปฏิเสธได้" };
  }
}

export async function approveTransferRequestAction(id: string, handlerId: string) {
  try {
    await ChildTransferRequestAction.updateRequest(id, {
      requestStatus: Request_status.APPROVE,
      handledBy: handlerId
    });
    revalidatePath(`/desktop/requests/transfer/${id}`);
    revalidatePath("/desktop/requests");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve transfer request:", error);
    return { success: false, error: "ไม่สามารถอนุมัติได้" };
  }
}

export async function rejectTransferRequestAction(id: string, handlerId: string) {
  try {
    await ChildTransferRequestAction.updateRequest(id, {
      requestStatus: Request_status.REJECT,
      handledBy: handlerId
    });
    revalidatePath(`/desktop/requests/transfer/${id}`);
    revalidatePath("/desktop/requests");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject transfer request:", error);
    return { success: false, error: "ไม่สามารถปฏิเสธได้" };
  }
}
