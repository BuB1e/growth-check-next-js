// TODO: Aligned with real backend API spec
export interface ChildTransferRequestResponse {
  id: number;
  userId: string;
  childId: number;
  fromLocation: number;
  toLocation: number;
  handledBy: string;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
}

// TODO: Request body for POST /child-transfer-requests/
export interface CreateChildTransferRequest {
  userId: string;
  childId: number;
  fromLocation: number;
  toLocation: number;
  handledBy: string;
}

// TODO: Request body for PATCH /child-transfer-requests/{id}
export interface UpdateChildTransferRequest {
  userId?: string;
  childId?: number;
  fromLocation?: number;
  toLocation?: number;
  handledBy?: string;
}

// TODO: Query params for GET /child-transfer-requests/
export interface GetChildTransferRequestsParams {
  page?: number;
  limit?: number;
  userId?: string;
  childId?: number;
  fromLocation?: number;
  toLocation?: number;
  handledBy?: string;
  deleteStatus?: boolean;
}
