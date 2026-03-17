import { Child_status } from "@/types";
import { DevelopmentResponse } from "./DevelopmentDTO";

export interface ChildDataResponse {
  id: number;
	childId: number;
	locationId: number;
	height: number;
	weight: number;
	heightDevelopmentId: number;
	weightDevelopmentId: number;
	heightDate: Date;
	userCreated: string;
	userUpdated: string;
  createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
  status: Child_status;
  weightDevelopment?: DevelopmentResponse;
  heightDevelopment?: DevelopmentResponse;
}

export interface CreateChildDataDTO {
	childId: number;
	locationId: number;
	height: number;
	weight: number;
	heightDevelopmentId: number;
	weightDevelopmentId: number;
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
}
