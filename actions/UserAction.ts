

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersByTeamParams,
  GetUsersParams,
} from "@/dto";

export class UserAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/users";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getUsers(
    params: GetUsersParams = {},
  ): Promise<UserResponse[]> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getUsersByTeam(
    teamId: number,
    params: GetUsersByTeamParams = {},
  ): Promise<UserResponse[]> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/teams/${teamId}/users`,
      { params: defaultParams },
    );
    return response.data;
  }

  static async getUserById(id: string): Promise<UserResponse> {
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getById/${id}`,
    );
    return response.data;
  }

  static async getUserByEmail(email: string): Promise<UserResponse> {
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getByEmail/${email}`,
    );
    return response.data;
  }

  static async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateUser(
    id: string,
    data: UpdateUserRequest,
  ): Promise<UserResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
