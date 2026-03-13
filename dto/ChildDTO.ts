// Aligned with real backend API spec (refactored DB)
export type ChildStatus = "IN_AREA" | "OUT_AREA" | "UNKNOWN" | "DIED";
export type ChildSex = "MALE" | "FEMALE";

export interface ChildResponse {
  id: number;
  firstName: string;
  lastName: string;
  locationId: number;
  birthDate: string;
  sex: ChildSex;
  createdByUser: string;
  updatedByUser: string;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
  // status may come from child-data — verify with backend
  status?: ChildStatus;
}

// Request body for POST /children/
export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  locationId: number;
  birthDate: string;
  sex: ChildSex;
  createdByUser: string;
  updatedByUser: string;
}

// Request body for PATCH /children/{id}
export interface UpdateChildRequest {
  firstName?: string;
  lastName?: string;
  locationId?: number;
  sex?: ChildSex;
  birthDate?: string;
  updatedByUser?: string;
}

// Query params for GET /children/
export interface GetChildrenParams {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  locationId?: number;
  createdByUser?: string;
  deleteStatus?: boolean;
}

// Request body for PUT /children/predict/{id}
export interface PredictChildRequest {
  model: string;
}
