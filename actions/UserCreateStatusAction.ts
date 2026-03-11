"use server";

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
  // TODO: Fixed endpoint from "/user-create-statuses" to "/user-create-status" (matching real API)
  static API_ENDPOINT = "/user-create-status";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /user-create-status/ — list with query params
  static async getStatuses(
    params?: GetUserCreateStatusParams,
  ): Promise<PaginatedResponse<UserCreateStatusResponse>> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params });
    return response.data;
  }

  // TODO: GET /user-create-status/{id}
  static async getStatusById(id: string): Promise<UserCreateStatusResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  // TODO: POST /user-create-status/
  static async createStatus(
    data: CreateUserCreateStatusRequest,
  ): Promise<UserCreateStatusResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /user-create-status/{id}
  static async updateStatus(
    id: string,
    data: UpdateUserCreateStatusRequest,
  ): Promise<UserCreateStatusResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /user-create-status/{id}
  static async deleteStatus(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
