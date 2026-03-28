import { DevelopmentResponse } from "./DevelopmentDTO";

export interface AiPredictionResponse {
	id: number;
	childId: number;
	heightDevelopmentId: number | null;
	weightDevelopmentId: number | null;
	heightDevelopmentIds: number[];
	weightDevelopmentIds: number[];
	heightDevelopmentIdList?: number[];
	weightDevelopmentIdList?: number[];
	heightDevelopmentList?: DevelopmentResponse[];
	weightDevelopmentList?: DevelopmentResponse[];
	dataMonthsUsed: number;
	modelUsed: string;
	height: number[];
	weight: number[];
	createdAt: Date;
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
