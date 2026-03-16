

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildDataResponse,
  CreateChildDataDTO,
  UpdateChildDataDTO,
  OptionsGetChildDataDTO,
} from "@/dto";

type GetChildDataParams = OptionsGetChildDataDTO & {
  page?: number;
  limit?: number;
};

export class ChildDataAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/child-data";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getChildDataList(
    params: GetChildDataParams = {},
  ): Promise<ChildDataResponse[]> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  }

  static async getChildDataById(id: string): Promise<ChildDataResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createChildData(
    data: CreateChildDataDTO,
  ): Promise<ChildDataResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateChildData(
    id: string,
    data: UpdateChildDataDTO,
  ): Promise<ChildDataResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteChildData(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
