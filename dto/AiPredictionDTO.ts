// Aligned with real backend API spec
export interface AiPredictionResponse {
  id: number;
  childId: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
  dataMonthsUsed: number;
  modelUsed: string;
  modelVersion: string;
  dateTime: string;
  month: number;
  height: number[];
  weight: number[];
  createdAt: string;
}

// Request body for POST /ai-predictions/
export interface CreateAiPredictionRequest {
  childId: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
  dataMonthsUsed: number;
  modelUsed: string;
  modelVersion: string;
  dateTime: string;
  month: number;
  height: number[];
  weight: number[];
}

// Request body for PATCH /ai-predictions/{id}
export interface UpdateAiPredictionRequest {
  childId?: number;
  heightDevelopmentId?: number;
  weightDevelopmentId?: number;
  dataMonthsUsed?: number;
  modelUsed?: string;
  modelVersion?: string;
  dateTime?: string;
  month?: number;
  height?: number[];
  weight?: number[];
}

// Query params for GET /ai-predictions/
export interface GetAiPredictionsParams {
  page?: number;
  limit?: number;
  childId?: number;
  month?: number;
  modelUsed?: string;
  modelVersion?: string;
}
