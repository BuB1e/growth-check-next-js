"use server";

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildDataResponse,
  CreateChildDataRequest,
  UpdateChildDataRequest,
  GetChildDataParams,
  PaginatedResponse,
} from "@/dto";

export class ChildDataAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/child-data";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /child-data/ — list with query params
  static async getChildDataList(
    params?: GetChildDataParams,
  ): Promise<PaginatedResponse<ChildDataResponse>> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params });
    return response.data;
  }

  // TODO: GET /child-data/{id}
  static async getChildDataById(id: string): Promise<ChildDataResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  // TODO: POST /child-data/
  static async createChildData(
    data: CreateChildDataRequest,
  ): Promise<ChildDataResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /child-data/{id}
  static async updateChildData(
    id: string,
    data: UpdateChildDataRequest,
  ): Promise<ChildDataResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /child-data/{id}
  static async deleteChildData(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
