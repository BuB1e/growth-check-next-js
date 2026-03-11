"use server";

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildTransferRequestResponse,
  CreateChildTransferRequest,
  UpdateChildTransferRequest,
  GetChildTransferRequestsParams,
  PaginatedResponse,
} from "@/dto";

export class ChildTransferRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/child-transfer-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /child-transfer-requests/ — list with query params
  static async getRequests(
    params?: GetChildTransferRequestsParams,
  ): Promise<PaginatedResponse<ChildTransferRequestResponse>> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params });
    return response.data;
  }

  // TODO: GET /child-transfer-requests/{id}
  static async getRequestById(
    id: string,
  ): Promise<ChildTransferRequestResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  // TODO: POST /child-transfer-requests/
  static async createRequest(
    data: CreateChildTransferRequest,
  ): Promise<ChildTransferRequestResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /child-transfer-requests/{id}
  static async updateRequest(
    id: string,
    data: UpdateChildTransferRequest,
  ): Promise<ChildTransferRequestResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /child-transfer-requests/{id}
  static async deleteRequest(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
