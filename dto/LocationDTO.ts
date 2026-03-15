export interface LocationResponse {
  id: number;
	name: string;
	map: string;
	province: string;
	district: string;
	subDistrict: string;
	zipCode: string;
	teamId: number;
	requestId: number;
	createdByUser: string;
	createdAt: Date;
	updatedAt: Date;
	deleteStatus: boolean;
}

export interface CreateLocationDTO {
	name: string;
	map: string;
	province: string;
	district: string;
	subDistrict: string;
	zipCode: string;
	teamId: number;
	requestId: number;
	createdByUser: string;
}


export interface UpdateLocationDTO {
	name?: string;
	map?: string;
	province?: string;
	district?: string;
	subDistrict?: string;
	zipCode?: string;
}


export interface UpdatePrivateLocationDTO{
	name?: string;
	map?: string;
	province?: string;
	district?: string;
	subDistrict?: string;
	zipCode?: string;
	teamId: number;
	requestId: number;
	createdByUser: string;
}


export interface OptionsGetAllLocationDTO{
	map?: string;
	province?: string;
	district?: string;
	subDistrict?: string;
	zipCode?: string;
	deleted?: boolean;
	createdByUser?: string;
}
