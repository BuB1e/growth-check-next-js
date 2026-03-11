// TODO: Aligned with real backend API spec
export interface TeamResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deleteStatus: boolean;
}

// TODO: Request body for POST /teams/
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

// TODO: Request body for PATCH /teams/{id}
export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

// TODO: Query params for GET /teams/
export interface GetTeamsParams {
  page?: number;
  limit?: number;
  deleted?: boolean;
}
