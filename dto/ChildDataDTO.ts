import type { DevelopmentResponse } from "./DevelopmentDTO";

// TODO: Aligned with real backend API spec
export type ChildDataStatus = "IN_AREA" | "OUT_AREA" | "UNKNOWN" | "DIED";

export interface ChildDataResponse {
  id: number;
  childId: number;
  locationId: number;
  height: number;
  weight: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
  index: number;
  heightDate: string;
  userCreated: string;
  userUpdated: string;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
  status: ChildDataStatus;
  heightDevelopment?: DevelopmentResponse;
  weightDevelopment?: DevelopmentResponse;
}

// TODO: Request body for POST /child-data/
export interface CreateChildDataRequest {
  childId: number;
  locationId: number;
  height: number;
  weight: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
  index: number;
  heightDate: string;
  userCreated: string;
  userUpdated: string;
  status?: ChildDataStatus;
}

// TODO: Request body for PATCH /child-data/{id}
export interface UpdateChildDataRequest {
  childId?: number;
  locationId?: number;
  height?: number;
  weight?: number;
  heightDevelopmentId?: number;
  weightDevelopmentId?: number;
  index?: number;
  heightDate?: string;
  userUpdated?: string;
  status?: ChildDataStatus;
}

// TODO: Query params for GET /child-data/
export interface GetChildDataParams {
  page?: number;
  limit?: number;
  childId?: number;
  locationId?: number;
  status?: ChildDataStatus;
  deleteStatus?: boolean;
}
