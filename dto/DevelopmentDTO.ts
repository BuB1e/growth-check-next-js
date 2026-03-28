import { DevelopmentStatus, Metric_type } from "@/types";

export interface DevelopmentResponse {
	id: number;
	status: DevelopmentStatus;
	metric: Metric_type;
	detail?: string | null;
	minAge: number;
	maxAge: number;
	suggestion: string;
	createdAt: Date;
	updatedAt: Date;
	deleteStatus: boolean;
}

export interface CreateDevelopmentDTO {
	status: DevelopmentStatus;
	metric: Metric_type;
	detail?: string;
	minAge: number;
	maxAge: number;
	suggestion: string;
}

export interface UpdateDevelopmentDTO {
	status?: DevelopmentStatus;
	metric?: Metric_type;
	detail?: string;
	minAge?: number;
	maxAge?: number;
	suggestion?: string;
	deleteStatus?: boolean;
}

export interface OptionsGetDevelopmentsDTO {
	q?: string;
	status?: DevelopmentStatus;
	metric?: Metric_type;
	deleteStatus?: boolean;
}
