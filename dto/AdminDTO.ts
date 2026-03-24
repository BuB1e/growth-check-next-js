import { Sex } from "@/types";

export interface DashboardChartFilterDTO {
	startDate?: Date;
	endDate?: Date;
	locationId?: number;
	minAge?: number;
	maxAge?: number;
	sex?: Sex;
}

export interface DashboardChartResponseDTO {
	date: string;
	heightAbove: number;
	heightNormal: number;
	heightBelow: number;
	weightAbove: number;
	weightNormal: number;
	weightBelow: number;
}

export interface DashboardSummaryResponseDTO {
	totalChildren: number;
	totalStaff: number;
	totalLocations: number;
	totalPendingRequests: number;
}
