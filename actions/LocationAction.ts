

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  LocationResponse,
  CreateLocationDTO,
  UpdateLocationDTO,
  OptionsGetAllLocationDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetLocationsParams = OptionsGetAllLocationDTO & {
  page?: number;
  limit?: number;
};

export class LocationAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/locations";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getLocations(
    params: GetLocationsParams = {},
  ): Promise<PaginatedResponseDTO<LocationResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getLocationById(id: string): Promise<LocationResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createLocation(
    data: CreateLocationDTO,
  ): Promise<LocationResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateLocation(
    id: string,
    data: UpdateLocationDTO,
  ): Promise<LocationResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteLocation(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
