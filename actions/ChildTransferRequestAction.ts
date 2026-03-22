

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildTransferRequestResponse,
  CreateChildTransferRequestDTO,
  UpdateChildTransferRequestDTO,
  OptionsGetChildTransferRequestsDTO,
  PaginatedResponseDTO,
} from "@/dto";
import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetChildTransferRequestsParams = OptionsGetChildTransferRequestsDTO & {
  page?: number;
  limit?: number;
};

export class ChildTransferRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/child-transfer-requests";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getRequests(
    params: GetChildTransferRequestsParams = {},
  ): Promise<PaginatedResponseDTO<ChildTransferRequestResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const activeHeaders = typeof window === 'undefined' ? await getForwardHeaders() : undefined;
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { 
      params: defaultParams,
      headers: activeHeaders
    });
    return response.data;
  }

  static async getRequestById(
    id: string,
  ): Promise<ChildTransferRequestResponse> {
    const activeHeaders = typeof window === 'undefined' ? await getForwardHeaders() : undefined;
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders
    });
    return response.data;
  }

  static async createRequest(
    data: CreateChildTransferRequestDTO,
  ): Promise<ChildTransferRequestResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateRequest(
    id: string,
    data: UpdateChildTransferRequestDTO,
  ): Promise<ChildTransferRequestResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteRequest(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
