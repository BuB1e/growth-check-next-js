// Aligned with real backend API spec
export type DevelopmentMetric = "WA" | "HA" | "BMI" | "WH" | "WL";

export interface DevelopmentResponse {
  id: number;
  status: string;
  metric: DevelopmentMetric;
  detail: string | null;
  minAge: number;
  maxAge: number;
  suggestion: string;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
}

// Request body for POST /developments/
export interface CreateDevelopmentRequest {
  status: string;
  metric: DevelopmentMetric;
  detail?: string;
  minAge: number;
  maxAge: number;
  suggestion: string;
}

// Request body for PATCH /developments/{id}
export interface UpdateDevelopmentRequest {
  status?: string;
  metric?: DevelopmentMetric;
  detail?: string;
  minAge?: number;
  maxAge?: number;
  suggestion?: string;
  deleteStatus?: boolean;
}

// Query params for GET /developments/
export interface GetDevelopmentsParams {
  page?: number;
  limit?: number;
  status?: string;
  metric?: DevelopmentMetric;
  deleteStatus?: boolean;
}
