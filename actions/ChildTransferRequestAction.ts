

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildTransferRequestResponse,
  CreateChildTransferRequestDTO,
  UpdateChildTransferRequestDTO,
  OptionsGetChildTransferRequestsDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetChildTransferRequestsParams = OptionsGetChildTransferRequestsDTO & {
  page?: number;
  limit?: number;
};

export class ChildTransferRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/child-transfer-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getRequests(
    params: GetChildTransferRequestsParams = {},
  ): Promise<PaginatedResponseDTO<ChildTransferRequestResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getRequestById(
    id: string,
  ): Promise<ChildTransferRequestResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
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
