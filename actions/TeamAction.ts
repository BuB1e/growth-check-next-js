

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  TeamResponse,
  CreateTeamDto,
  UpdateTeamDto,
  OptionsGetTeamsDTO,
  PaginatedResponseDTO,
} from "@/dto";
// import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetTeamsParams = OptionsGetTeamsDTO & {
  page?: number;
  limit?: number;
};

export class TeamAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/teams";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getTeams(
    params: GetTeamsParams = {},
    headers?: Record<string, string>,
  ): Promise<PaginatedResponseDTO<TeamResponse>> {
    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, {
      params: defaultParams,
      headers: activeHeaders
    });
    return response.data;
  }

  static async getTeamById(id: number | string, headers?: Record<string, string>): Promise<TeamResponse> {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error("Invalid team ID");
    }
    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders
    });
    return response.data;
  }

  static async createTeam(data: CreateTeamDto): Promise<TeamResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async updateTeam(
    id: number,
    data: UpdateTeamDto,
  ): Promise<TeamResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async deleteTeam(id: number): Promise<void> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
  }
}
