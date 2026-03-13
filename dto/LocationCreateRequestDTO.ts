// Aligned with real backend API spec (refactored DB — GET list added)
export type LocationRequestStatus = "APPROVE" | "REJECT" | "WAITING";

export interface LocationCreateRequestResponse {
  id: number;
  userId: string;
  locationName: string;
  locationMap: string;
  province: string;
  district: string;
  sub_district: string;
  zip_code: string;
  requestStatus: LocationRequestStatus;
  handledBy: string | null;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
}

// Request body for POST /location-create-requests/
export interface CreateLocationCreateRequest {
  userId: string;
  locationName: string;
  locationMap: string;
  province: string;
  district: string;
  sub_district: string;
  zip_code: string;
}

// Request body for PATCH /location-create-requests/{id}
export interface UpdateLocationCreateRequest {
  locationName?: string;
  locationMap?: string;
  province?: string;
  district?: string;
  sub_district?: string;
  zip_code?: string;
  requestStatus?: LocationRequestStatus;
  handledBy?: string;
  deleteStatus?: boolean;
}

// Query params for GET /location-create-requests/
export interface GetLocationCreateRequestsParams {
  page?: number;
  limit?: number;
  locationName?: string;
  locationMap?: string;
  province?: string;
  district?: string;
  sub_district?: string;
  zip_code?: string;
  requestStatus?: LocationRequestStatus;
  handledBy?: string;
  deleteStatus?: boolean;
}
