// TODO: Aligned with real backend API spec
export type UserCreateRequestStatus = "APPROVE" | "REJECT" | "WAITING";

export interface UserCreateStatusResponse {
  id: string;
  userId: string;
  requestStatus: UserCreateRequestStatus;
  rejectReason: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  createdAt: string;
}

// TODO: Request body for POST /user-create-status/
export interface CreateUserCreateStatusRequest {
  userId: string;
}

// TODO: Request body for PATCH /user-create-status/{id}
export interface UpdateUserCreateStatusRequest {
  requestStatus?: UserCreateRequestStatus;
  updatedBy?: string;
  rejectReason?: string;
}

// TODO: Query params for GET /user-create-status/
export interface GetUserCreateStatusParams {
  page?: number;
  limit?: number;
  deleted?: boolean;
}
