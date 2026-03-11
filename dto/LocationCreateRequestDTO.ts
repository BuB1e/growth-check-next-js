// TODO: Aligned with real backend API spec
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
  handledBy: string;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
}

// TODO: Request body for POST /location-create-requests/
export interface CreateLocationCreateRequest {
  userId: string;
  locationName: string;
  locationMap: string;
  province: string;
  district: string;
  sub_district: string;
  zip_code: string;
}

// TODO: Request body for PATCH /location-create-requests/{id}
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
