export interface PaginatedMetaDTO {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface PaginatedResponseDTO<T> {
	data: T[];
	meta: PaginatedMetaDTO;
}
