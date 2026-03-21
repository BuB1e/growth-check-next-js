import { Sex } from "@/types";

export interface DashboardChartRequestDTO {
  startDate?: string;
  endDate?: string;
  locationId?: string | number;
  minAge?: string | number;
  maxAge?: string | number;
  sex?: Sex | string;
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
