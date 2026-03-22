

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  DevelopmentResponse,
  CreateDevelopmentDTO,
  UpdateDevelopmentDTO,
  OptionsGetDevelopmentsDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetDevelopmentsParams = OptionsGetDevelopmentsDTO & {
  page?: number;
  limit?: number;
};

export class DevelopmentAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/developments";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getDevelopments(
    params: GetDevelopmentsParams = {},
  ): Promise<PaginatedResponseDTO<DevelopmentResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getDevelopmentById(id: string): Promise<DevelopmentResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createDevelopment(
    data: CreateDevelopmentDTO,
  ): Promise<DevelopmentResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateDevelopment(
    id: string,
    data: UpdateDevelopmentDTO,
  ): Promise<DevelopmentResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteDevelopment(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
