"use server";

import { ChildDataAction } from "@/actions/ChildDataAction";
import type { CreateChildDataDTO } from "@/dto";

export async function createChildDataAction(
  data: CreateChildDataDTO,
) {
  return await ChildDataAction.createChildData(data);
}
