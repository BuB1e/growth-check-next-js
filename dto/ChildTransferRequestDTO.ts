// Aligned with real backend API spec
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

// Request body for POST /child-transfer-requests/
export interface CreateChildTransferRequest {
  userId: string;
  childId: number;
  fromLocation: number;
  toLocation: number;
  handledBy: string;
}

// Request body for PATCH /child-transfer-requests/{id}
export interface UpdateChildTransferRequest {
  userId?: string;
  childId?: number;
  fromLocation?: number;
  toLocation?: number;
  handledBy?: string;
}

// Query params for GET /child-transfer-requests/
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
