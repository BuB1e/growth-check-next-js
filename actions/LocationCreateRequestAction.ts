"use server";

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  LocationCreateRequestResponse,
  CreateLocationCreateRequest,
  UpdateLocationCreateRequest,
} from "@/dto";

export class LocationCreateRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/location-create-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /location-create-requests/{id}
  static async getRequestById(
    id: number,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  // TODO: GET /location-create-requests/user/{userId} — list by user with pagination
  static async getRequestsByUserId(
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<LocationCreateRequestResponse[]> {
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/user/${userId}`,
      { params },
    );
    return response.data;
  }

  // TODO: POST /location-create-requests/
  static async createRequest(
    data: CreateLocationCreateRequest,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /location-create-requests/{id}
  static async updateRequest(
    id: number,
    data: UpdateLocationCreateRequest,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /location-create-requests/{id}
  static async deleteRequest(id: number): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
