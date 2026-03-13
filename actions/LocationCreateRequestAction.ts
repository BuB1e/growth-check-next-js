

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  LocationCreateRequestResponse,
  CreateLocationCreateRequest,
  UpdateLocationCreateRequest,
  GetLocationCreateRequestsParams,
} from "@/dto";

export class LocationCreateRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/location-create-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getRequests(
    params: GetLocationCreateRequestsParams = {},
  ): Promise<LocationCreateRequestResponse[]> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
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
    params: { page?: number; limit?: number } = {},
  ): Promise<LocationCreateRequestResponse[]> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/user/${userId}`,
      { params: defaultParams },
    );
    return response.data;
  }

  static async createRequest(
    data: CreateLocationCreateRequest,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateRequest(
    id: number,
    data: UpdateLocationCreateRequest,
  ): Promise<LocationCreateRequestResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteRequest(id: number): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
