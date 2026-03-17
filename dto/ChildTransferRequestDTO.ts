export interface ChildTransferRequestResponse {
  id: number;
	userId: string;
	childId: number;
	fromLocation: number;
	toLocation: number;
	handledBy: string;
	createdAt: Date;
	updatedAt: Date;
	deleteStatus: boolean;
}

export interface CreateChildTransferRequestDTO {
	userId: string;
	childId: number;
	fromLocation: number;
	toLocation: number;
	handledBy: string;
}

export interface UpdateChildTransferRequestDTO {
	userId?: string;
	childId?: number;
	fromLocation?: number;
	toLocation?: number;
	handledBy?: string;
}

export interface OptionsGetChildTransferRequestsDTO {
	q?: string;
	userId?: string;
	childId?: number;
	fromLocation?: number;
	toLocation?: number;
	handledBy?: string;
	deleteStatus?: boolean;
}
