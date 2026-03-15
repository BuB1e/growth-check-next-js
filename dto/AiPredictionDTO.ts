// Aligned with real backend API spec
export interface AiPredictionResponse {
  id: number;
	childId: number;
	heightDevelopmentId: number;
	weightDevelopmentId: number;
	dataMonthsUsed: number;
	modelUsed: string;
	modelVersion: string;
	dateTime: Date;
	month: number;
	height: number;
	weight: number;
	createdAt: Date;
}

export interface CreateAiPredictionDTO {
	childId: number;
	heightDevelopmentId: number;
	weightDevelopmentId: number;
	dataMonthsUsed: number;
	modelUsed: string;
	modelVersion: string;
	dateTime: Date;
	month: number;
	height: number;
	weight: number;
}

export interface UpdateAiPredictionDTO {
	childId?: number;
	heightDevelopmentId?: number;
	weightDevelopmentId?: number;
	dataMonthsUsed?: number;
	modelUsed?: string;
	modelVersion?: string;
	dateTime?: Date;
	month?: number;
	height?: number;
	weight?: number;
}

export interface OptionsGetAiPredictionsDTO {
	childId?: number;
	month?: number;
	modelUsed?: string;
	modelVersion?: string;
}
