// Aligned with real backend API spec
export type UserCreateRequestStatus = "APPROVE" | "REJECT" | "WAITING";

export interface UserCreateStatusResponse {
  id: number;
  userId: string;
  requestStatus: UserCreateRequestStatus;
  rejectReason: string | null;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
  deleteStatus: boolean;
}

// Request body for POST /user-create-status/
export interface CreateUserCreateStatusRequest {
  userId: string;
}

// Request body for PATCH /user-create-status/{id}
export interface UpdateUserCreateStatusRequest {
  requestStatus?: UserCreateRequestStatus;
  updatedBy?: string;
  rejectReason?: string;
}

// Query params for GET /user-create-status/
export interface GetUserCreateStatusParams {
  page?: number;
  limit?: number;
  deleted?: boolean;
}
