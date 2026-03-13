

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserCreateStatusResponse,
  CreateUserCreateStatusRequest,
  UpdateUserCreateStatusRequest,
  GetUserCreateStatusParams,
  PaginatedResponse,
} from "@/dto";

export class UserCreateStatusAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/user-create-status";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getStatuses(
    params: GetUserCreateStatusParams = {},
  ): Promise<PaginatedResponse<UserCreateStatusResponse>> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getStatusById(id: string): Promise<UserCreateStatusResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createStatus(
    data: CreateUserCreateStatusRequest,
  ): Promise<UserCreateStatusResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateStatus(
    id: string,
    data: UpdateUserCreateStatusRequest,
  ): Promise<UserCreateStatusResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteStatus(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
