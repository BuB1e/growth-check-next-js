

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  LocationCreateRequestResponse,
  CreateLocationRequestDTO,
  UpdateLocationRequestDTO,
  OptionsLocationCreateRequestDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetLocationCreateRequestsParams = OptionsLocationCreateRequestDTO & {
  page?: number;
  limit?: number;
};

export class LocationCreateRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/location-create-requests";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getRequests(
    params: GetLocationCreateRequestsParams = {},
  ): Promise<PaginatedResponseDTO<LocationCreateRequestResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getRequestById(
    id: number,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async getRequestsByUserId(
    userId: string,
    params: GetLocationCreateRequestsParams = {},
  ): Promise<PaginatedResponseDTO<LocationCreateRequestResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/user/${userId}`,
      { params: defaultParams },
    );
    return response.data;
  }

  static async createRequest(
    data: CreateLocationRequestDTO,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateRequest(
    id: number,
    data: UpdateLocationRequestDTO,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteRequest(id: number): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
