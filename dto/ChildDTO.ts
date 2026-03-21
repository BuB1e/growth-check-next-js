import { Child_status, Sex } from "@/types";

export interface ChildResponse {
  id: number;
	firstName: string;
	lastName: string;
	locationId: number;
	birthDate: Date;
	sex: Sex;
	createdByUser: string;
	updatedByUser: string;
	createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
  status: Child_status;
}

export interface CreateChildDTO {
	firstName: string;
	lastName: string;
	locationId: number;
	sex: Sex;
	birthDate: Date;
	createdByUser: string;
	updatedByUser: string;
}

export interface UpdateChildDTO {
	firstName?: string;
	lastName?: string;
	locationId?: number;
	birthDate?: Date;
	updatedByUser?: string;
	sex?: Sex;
}

export interface OptionsGetChildrenDTO {
	q?: string;
	firstName?: string;
	lastName?: string;
	locationId?: number;
	createdByUser?: string;
	deleteStatus?: boolean;
	minAge?: number | string;
	maxAge?: number | string;
	haStatus?: string;
	waStatus?: string;
}
