

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserCreateStatusResponse,
  CreateUserCreateStatusDto,
  UpdateUserCreateStatusDto,
  OptionsGetUserCreateStatusDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetUserCreateStatusParams = OptionsGetUserCreateStatusDTO & {
  page?: number;
  limit?: number;
};

export class UserCreateStatusAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/user-create-status";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getStatuses(
    params: GetUserCreateStatusParams = {},
    headers?: Record<string, string>,
  ): Promise<PaginatedResponseDTO<UserCreateStatusResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };

    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }

    console.log(`[UserCreateStatusAction] Fetching statuses: ${this.ACTION_ENDPOINT}`, defaultParams);
    const response = await axios.get(`${this.ACTION_ENDPOINT}`, {
      params: defaultParams,
      headers: activeHeaders,
    });
    return response.data;
  }

  static async getStatusById(id: string, headers?: Record<string, string>): Promise<UserCreateStatusResponse> {
    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }

    try {
      const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
        headers: activeHeaders
      });
      return response.data;
    } catch (error: unknown) {
      // Silently rethrow, logging done in calling context or proxy
      throw error;
    }
  }

  static async createStatus(
    data: CreateUserCreateStatusDto,
  ): Promise<UserCreateStatusResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async updateStatus(
    id: string,
    data: UpdateUserCreateStatusDto,
  ): Promise<UserCreateStatusResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async deleteStatus(id: string): Promise<void> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
  }
}
