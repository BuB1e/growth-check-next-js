

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserCreateStatusResponse,
  CreateUserCreateStatusDto,
  UpdateUserCreateStatusDto,
  OptionsGetUserCreateStatusDTO,
  PaginatedResponseDTO,
} from "@/dto";
import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetUserCreateStatusParams = OptionsGetUserCreateStatusDTO & {
  page?: number;
  limit?: number;
};

export class UserCreateStatusAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/user-create-status";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getStatuses(
    params: GetUserCreateStatusParams = {},
    headers?: any,
  ): Promise<PaginatedResponseDTO<UserCreateStatusResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const activeHeaders = headers || (typeof window === 'undefined' ? await getForwardHeaders() : undefined);
    console.log(`[UserCreateStatusAction] Fetching statuses: ${this.ACTION_ENDPOINT}`, defaultParams);
    const response = await axios.get(`${this.ACTION_ENDPOINT}`, {
      params: defaultParams,
      headers: activeHeaders,
    });
    return response.data;
  }

  static async getStatusById(id: string, headers?: any): Promise<UserCreateStatusResponse> {
    const activeHeaders = headers || (typeof window === 'undefined' ? await getForwardHeaders() : undefined);
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders
    });
    return response.data;
  }

  static async createStatus(
    data: CreateUserCreateStatusDto,
  ): Promise<UserCreateStatusResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateStatus(
    id: string,
    data: UpdateUserCreateStatusDto,
  ): Promise<UserCreateStatusResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteStatus(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
