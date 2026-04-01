

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  DevelopmentResponse,
  CreateDevelopmentDTO,
  UpdateDevelopmentDTO,
  OptionsGetDevelopmentsDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetDevelopmentsParams = OptionsGetDevelopmentsDTO & {
  page?: number;
  limit?: number;
};

export class DevelopmentAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/developments";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getDevelopments(
    params: GetDevelopmentsParams = {},
  ): Promise<PaginatedResponseDTO<DevelopmentResponse>> {
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
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

  static async getDevelopmentById(id: string): Promise<DevelopmentResponse> {
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders
    });
    return response.data;
  }

  static async createDevelopment(
    data: CreateDevelopmentDTO,
  ): Promise<DevelopmentResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async updateDevelopment(
    id: string,
    data: UpdateDevelopmentDTO,
  ): Promise<DevelopmentResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async deleteDevelopment(id: string): Promise<void> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
  }
}
