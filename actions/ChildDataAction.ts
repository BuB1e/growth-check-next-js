

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildDataResponse,
  CreateChildDataRequest,
  UpdateChildDataRequest,
  GetChildDataParams,
} from "@/dto";

export class ChildDataAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/child-data";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getChildDataList(
    params: GetChildDataParams = {},
  ): Promise<ChildDataResponse[]> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getChildDataById(id: string): Promise<ChildDataResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createChildData(
    data: CreateChildDataRequest,
  ): Promise<ChildDataResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateChildData(
    id: string,
    data: UpdateChildDataRequest,
  ): Promise<ChildDataResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteChildData(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
