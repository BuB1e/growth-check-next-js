import { Child_status } from "@/types";
import { DevelopmentResponse } from "./DevelopmentDTO";

// TODO: age object returned by backend GET endpoints (age.year / age.month)
export interface ChildAgeObject {
  year: number;
  month: number;
}

export interface ChildDataResponse {
  id: number;
	childId: number;
	locationId: number;
	height: number;
	weight: number;
	age: number | ChildAgeObject;
	heightDevelopmentId: number;
	weightDevelopmentId: number;
	heightDate: Date;
	userCreated: string;
	userUpdated: string;
	createdAt: Date;
	updatedAt: Date;
	deleteStatus: boolean;
	status: Child_status;
}

export interface CreateChildDataDTO {
	childId: number;
	locationId: number;
	height: number;
	weight: number;
	// age: toMonths(body.ageYear, body.ageMonth) <= this is backend logic so we need to split age into ageYear and ageMonth
	ageYear: number;
	ageMonth: number;
	heightDevelopmentId?: number;
	weightDevelopmentId?: number;
	heightDate: Date;
	userCreated: string;
	userUpdated: string;
	status?: Child_status;
}

export interface UpdateChildDataDTO {
	childId?: number;
	locationId?: number;
	height?: number;
	weight?: number;
	age?: number;
	heightDevelopmentId?: number;
	weightDevelopmentId?: number;
	heightDate?: Date;
	userUpdated?: string;
	status?: Child_status;
}

export interface OptionsGetChildDataDTO {
	q?: string;
	childId?: number;
	locationId?: number;
	status?: Child_status;
	deleteStatus?: boolean;
	age?: number;
}
