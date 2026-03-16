

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserCreateStatusResponse,
  CreateUserCreateStatusDto,
  UpdateUserCreateStatusDto,
  PaginatedResponseDTO,
} from "@/dto";

type GetUserCreateStatusParams = {
  page?: number;
  limit?: number;
};

export class UserCreateStatusAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/user-create-status";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getStatuses(
    params: GetUserCreateStatusParams = {},
  ): Promise<PaginatedResponseDTO<UserCreateStatusResponse>> {
    const defaultParams = {
      page: 1,
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
