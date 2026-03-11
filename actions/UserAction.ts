"use server";

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersByTeamParams,
} from "@/dto";

export class UserAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/users";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /users/teams/{teamId}/users — list by team with pagination
  static async getUsersByTeam(
    teamId: number,
    params?: GetUsersByTeamParams,
  ): Promise<UserResponse[]> {
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/teams/${teamId}/users`,
      { params },
    );
    return response.data;
  }

  // TODO: GET /users/getById/{id}
  static async getUserById(id: string): Promise<UserResponse> {
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getById/${id}`,
    );
    return response.data;
  }

  // TODO: GET /users/getByEmail/{email}
  static async getUserByEmail(email: string): Promise<UserResponse> {
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getByEmail/${email}`,
    );
    return response.data;
  }

  // TODO: POST /users/
  static async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /users/{id}
  static async updateUser(
    id: string,
    data: UpdateUserRequest,
  ): Promise<UserResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /users/{id}
  static async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
