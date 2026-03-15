import { Request_status } from "@/types";

export interface LocationCreateRequestResponse {
  id: number;
  userId: string;
	locationName: string;
	locationMap: string;
	province: string;
	district: string;
	sub_district: string;
	zip_code: string;
	requestStatus: Request_status;
	handledBy: string;
	createdAt: Date;
	updatedAt: Date;
	deleteStatus: boolean;
}

export interface CreateLocationRequestDTO {
	userId: string;
	locationName: string;
	locationMap: string;
	province: string;
	district: string;
	sub_district: string;
	zip_code: string;
}

export interface UpdateLocationRequestDTO {
	userId?: string;
	locationName?: string;
	locationMap?: string;
	province?: string;
	district?: string;
	sub_district?: string;
	zip_code?: string;
	requestStatus?: Request_status;
	handledBy?: string;
}


export interface OptionsLocationCreateRequestDTO {
	locationName?: string;
	locationMap?: string;
	province?: string;
	district?: string;
	sub_district?: string;
	zip_code?: string;
	requestStatus?: Request_status;
	handledBy?: string;
	deleteStatus?: boolean;
}
