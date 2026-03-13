// Aligned with real backend API spec (camelCase fields)
export interface LocationResponse {
  id: number;
  name: string;
  map: string;
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
  teamId: number;
  requestId: number | null; // NULL = admin/manual
  createdByUser: string;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
  isPrivate: boolean;
  privateReason: string | null;
}

// Request body for POST /locations/
export interface CreateLocationRequest {
  name: string;
  map: string;
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
  teamId: number;
  requestId: number;
  createdByUser: string;
}

// Request body for PATCH /locations/{id}
export interface UpdateLocationRequest {
  map?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  zipCode?: string;
  isPrivate?: boolean;
  privateReason?: string;
}