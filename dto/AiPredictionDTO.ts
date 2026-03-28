import { DevelopmentResponse } from "./DevelopmentDTO";

// Aligned with real backend API spec (2026-03-27 handoff + hotfix March 28)
export interface AiPredictionResponse {
  id: number;
	childId: number;
	// Backward compatibility/convenience fields (last item in the array or null)
	heightDevelopmentId?: number;
	weightDevelopmentId?: number;
	dataMonthsUsed: number;
	modelUsed: string;
	modelVersion: string;
	dateTime: Date;
	month: number;
	height: number | number[];
	weight: number | number[];
	createdAt: Date;
	// New arrays for many-to-many developments
	heightDevelopmentIds?: number[];
	weightDevelopmentIds?: number[];
	heightDevelopments?: DevelopmentResponse[];
	weightDevelopments?: DevelopmentResponse[];
}

export interface CreateAiPredictionDTO {
	childId: number;
	heightDevelopmentIds?: number[];
	weightDevelopmentIds?: number[];
	heightDevelopmentId?: number;
	weightDevelopmentId?: number;
	dataMonthsUsed: number;
	modelUsed: string;
	modelVersion: string;
	dateTime: Date;
	month: number;
	height: number | number[];
	weight: number | number[];
}

export interface UpdateAiPredictionDTO {
	childId?: number;
	heightDevelopmentIds?: number[];
	weightDevelopmentIds?: number[];
	heightDevelopmentId?: number;
	weightDevelopmentId?: number;
	dataMonthsUsed?: number;
	modelUsed?: string;
	modelVersion?: string;
	dateTime?: Date;
	month?: number;
	height?: number | number[];
	weight?: number | number[];
}

export interface OptionsGetAiPredictionsDTO {
	q?: string;
	childId?: number;
	month?: number;
	modelUsed?: string;
	modelVersion?: string;
}
