export interface TeamResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
}

export interface CreateTeamDto {
	name: string;
}

export interface UpdateTeamDto {
	name?: string;
}

export interface OptionsGetTeamsDTO {
  q?: string;
  deleted?: boolean;
}
