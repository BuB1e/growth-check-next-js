import { Sex, Metric_type } from "@/types";

// TODO: GrowthReference GET response — bmiMean/bmiSd NOT yet returned by backend
export interface GrowthReferenceResponse {
  id: number;
  name: string;
  sex: Sex;
  metric: Metric_type;
  minAge: number;
  maxAge: number;
  weightMean: number;
  weightSd: number;
  heightMean: number;
  heightSd: number;
  // TODO: bmiMean and bmiSd are NOT included in GET responses yet (backend mapper pending)
  createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
}

// TODO: bmiMean and bmiSd are accepted on POST but will NOT appear in response
export interface CreateGrowthReferenceDTO {
  name: string;
  sex: Sex;
  metric: Metric_type;
  minAge: number;
  maxAge: number;
  weightMean: number;
  weightSd: number;
  heightMean: number;
  heightSd: number;
  // TODO: Send bmiMean/bmiSd in create/update payload — backend stores them but does not return yet
  bmiMean?: number;
  bmiSd?: number;
}

export interface UpdateGrowthReferenceDTO {
  name?: string;
  sex?: Sex;
  metric?: Metric_type;
  minAge?: number;
  maxAge?: number;
  weightMean?: number;
  weightSd?: number;
  heightMean?: number;
  heightSd?: number;
  // TODO: Same as create — bmiMean/bmiSd accepted on PATCH, not returned
  bmiMean?: number;
  bmiSd?: number;
}

export interface OptionsGetGrowthReferenceDTO {
  q?: string;
  sex?: Sex;
  metric?: Metric_type;
  deleteStatus?: boolean;
}
