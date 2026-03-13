import type { DevelopmentResponse } from "./DevelopmentDTO";

// Aligned with real backend API spec (refactored DB — index field removed)
export type ChildDataStatus = "IN_AREA" | "OUT_AREA" | "UNKNOWN" | "DIED";

export interface ChildDataResponse {
  id: number;
  childId: number;
  locationId: number;
  height: number;
  weight: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
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

// Request body for POST /child-data/
export interface CreateChildDataRequest {
  childId: number;
  locationId: number;
  height: number;
  weight: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
  heightDate: string;
  userCreated: string;
  userUpdated: string;
  status?: ChildDataStatus;
}

// Request body for PATCH /child-data/{id}
export interface UpdateChildDataRequest {
  childId?: number;
  locationId?: number;
  height?: number;
  weight?: number;
  heightDevelopmentId?: number;
  weightDevelopmentId?: number;
  heightDate?: string;
  userUpdated?: string;
  status?: ChildDataStatus;
}

// Query params for GET /child-data/
export interface GetChildDataParams {
  page?: number;
  limit?: number;
  childId?: number;
  locationId?: number;
  status?: ChildDataStatus;
  deleteStatus?: boolean;
}
