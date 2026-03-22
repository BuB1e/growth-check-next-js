

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  OptionsGetAllUserDTO,
} from "@/dto";
import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetUsersParams = OptionsGetAllUserDTO & {
  page?: number;
  limit?: number;
};

type GetUsersByTeamParams = OptionsGetAllUserDTO & {
  page?: number;
  limit?: number;
};

type UsersPayload =
  | UserResponse[]
  | {
      data?: UserResponse[];
    };

const normalizeUsersList = (payload: UsersPayload): UserResponse[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

export class UserAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/users";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getUsers(
    params: GetUsersParams = {},
    headers?: any,
  ): Promise<UserResponse[]> {
    const activeHeaders = headers || (typeof window === 'undefined' ? await getForwardHeaders() : undefined);
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get<UsersPayload>(`${this.ACTION_ENDPOINT}/`, {
      params: defaultParams,
      headers: activeHeaders,
    });
    return normalizeUsersList(response.data);
  }

  static async getUsersByTeam(
    teamId: number,
    params: GetUsersByTeamParams = {},
    headers?: any,
  ): Promise<UserResponse[]> {
    const activeHeaders = headers || (typeof window === 'undefined' ? await getForwardHeaders() : undefined);
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get<UsersPayload>(
      `${this.ACTION_ENDPOINT}/teams/${teamId}/users`,
      { 
        params: defaultParams,
        headers: activeHeaders 
      },
    );
    return normalizeUsersList(response.data);
  }

  static async getUserById(id: string, headers?: any): Promise<UserResponse> {
    const activeHeaders = headers || (typeof window === 'undefined' ? await getForwardHeaders() : undefined);
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getById/${id}`,
      { headers: activeHeaders }
    );
    return response.data;
  }

  static async getUserByEmail(email: string, headers?: any): Promise<UserResponse> {
    const activeHeaders = headers || (typeof window === 'undefined' ? await getForwardHeaders() : undefined);
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getByEmail/${email}`,
      { headers: activeHeaders }
    );
    return response.data;
  }

  static async createUser(data: CreateUserDto): Promise<UserResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
