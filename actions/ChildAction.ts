"use server";

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildResponse,
  CreateChildRequest,
  UpdateChildRequest,
  GetChildrenParams,
  PaginatedResponse,
} from "@/dto";

export class ChildAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/children";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /children/ — list with query params
  static async getChildren(
    params?: GetChildrenParams,
  ): Promise<PaginatedResponse<ChildResponse>> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params });
    return response.data;
  }

  // TODO: GET /children/{id}
  static async getChildById(id: string): Promise<ChildResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  // TODO: POST /children/
  static async createChild(data: CreateChildRequest): Promise<ChildResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /children/{id}
  static async updateChild(
    id: string,
    data: UpdateChildRequest,
  ): Promise<ChildResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /children/{id}
  static async deleteChild(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
