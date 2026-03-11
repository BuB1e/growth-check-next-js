"use server";

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

  // TODO: GET /teams/ — list with query params
  static async getTeams(
    params?: GetTeamsParams,
  ): Promise<PaginatedResponse<TeamResponse>> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params });
    return response.data;
  }

  // TODO: POST /teams/
  static async createTeam(data: CreateTeamRequest): Promise<TeamResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /teams/{id}
  static async updateTeam(
    id: number,
    data: UpdateTeamRequest,
  ): Promise<TeamResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /teams/{id}
  static async deleteTeam(id: number): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
