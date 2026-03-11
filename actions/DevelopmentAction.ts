"use server";

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  DevelopmentResponse,
  CreateDevelopmentRequest,
  UpdateDevelopmentRequest,
  GetDevelopmentsParams,
  PaginatedResponse,
} from "@/dto";

export class DevelopmentAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/developments";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /developments/ — list with query params
  static async getDevelopments(
    params?: GetDevelopmentsParams,
  ): Promise<PaginatedResponse<DevelopmentResponse>> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params });
    return response.data;
  }

  // TODO: GET /developments/{id}
  static async getDevelopmentById(id: string): Promise<DevelopmentResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  // TODO: POST /developments/
  static async createDevelopment(
    data: CreateDevelopmentRequest,
  ): Promise<DevelopmentResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /developments/{id}
  static async updateDevelopment(
    id: string,
    data: UpdateDevelopmentRequest,
  ): Promise<DevelopmentResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /developments/{id}
  static async deleteDevelopment(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
