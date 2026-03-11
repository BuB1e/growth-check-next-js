// TODO: Aligned with real backend API spec (camelCase fields)
export type ChildStatus = "IN_AREA" | "OUT_AREA" | "UNKNOWN" | "DIED";

export interface ChildResponse {
  id: number;
  firstName: string;
  lastName: string;
  locationId: number;
  birthDate: string;
  createdByUser: string;
  updatedByUser: string;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
  // TODO: status may come from child-data — verify with backend
  status?: ChildStatus;
}

// TODO: Request body for POST /children/
export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  locationId: number;
  birthDate: string;
  createdByUser: string;
  updatedByUser: string;
}

// TODO: Request body for PATCH /children/{id}
export interface UpdateChildRequest {
  firstName?: string;
  lastName?: string;
  locationId?: number;
  birthDate?: string;
  updatedByUser?: string;
}

// TODO: Query params for GET /children/
export interface GetChildrenParams {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  locationId?: number;
  createdByUser?: string;
  deleteStatus?: boolean;
}
