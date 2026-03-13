

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  TeamResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
  GetTeamsParams,
  PaginatedResponse,
} from "@/dto";

export class TeamAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/teams";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getTeams(
    params: GetTeamsParams = {},
  ): Promise<PaginatedResponse<TeamResponse>> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async createTeam(data: CreateTeamRequest): Promise<TeamResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateTeam(
    id: number,
    data: UpdateTeamRequest,
  ): Promise<TeamResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteTeam(id: number): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
