"use server";

import { ChildDataAction } from "@/actions/ChildDataAction";
import type { CreateChildDataRequest } from "@/dto";

export async function createChildDataAction(
  data: CreateChildDataRequest,
) {
  return await ChildDataAction.createChildData(data);
}
