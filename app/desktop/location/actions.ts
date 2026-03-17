"use server";

import { LocationAction } from "@/actions/LocationAction";
import { revalidatePath } from "next/cache";
import type { UpdateLocationDTO } from "@/dto";

export async function updateLocationAction(
  locationId: number,
  data: UpdateLocationDTO,
) {
  try {
    await LocationAction.updateLocation(locationId.toString(), data);

    revalidatePath("/location");
    revalidatePath(`/location/${locationId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update location:", error);
    return {
      success: false,
      error: "ไม่สามารถบันทึกข้อมูลชุมชนได้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}
