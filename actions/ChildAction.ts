

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildResponse,
  CreateChildDTO,
  UpdateChildDTO,
  OptionsGetChildrenDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetChildrenParams = OptionsGetChildrenDTO & {
  page?: number;
  limit?: number;
};

export class ChildAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/children";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;
  static PAGE_LIMIT = EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE;

  static async getChildren(
    params: GetChildrenParams = {},
  ): Promise<PaginatedResponseDTO<ChildResponse>> {
    const defaultParams = {
      page: 1,
      limit: ChildAction.PAGE_LIMIT,
      deleteStatus: false,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, {
      params: defaultParams,
    });

    // Normalize legacy array payloads to a paginated DTO shape.
    if (Array.isArray(response.data)) {
      const page = Number(defaultParams.page) || 1;
      const limit = Number(defaultParams.limit) || ChildAction.PAGE_LIMIT;
      const total = response.data.length;
      return {
        data: response.data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    return response.data;
  }

  static async getChildById(id: string): Promise<ChildResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createChild(data: CreateChildDTO): Promise<ChildResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateChild(
    id: string,
    data: UpdateChildDTO,
  ): Promise<ChildResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async predictChild(
    id: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await axios.put(`${this.ACTION_ENDPOINT}/predict/${id}`, data);
  }

  static async deleteChild(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}

