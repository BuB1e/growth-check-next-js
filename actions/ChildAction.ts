

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildResponse,
  CreateChildRequest,
  UpdateChildRequest,
  GetChildrenParams,
  PredictChildRequest,
} from "@/dto";

export class ChildAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/children";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getChildren(
    params: GetChildrenParams = {},
  ): Promise<ChildResponse[]> {
    const defaultParams = {
      page: EnvConfig.NEXT_PUBLIC_PAGINATION_PAGE_DESKTOP_SIZE,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
  }

  static async getChildById(id: string): Promise<ChildResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createChild(data: CreateChildRequest): Promise<ChildResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateChild(
    id: string,
    data: UpdateChildRequest,
  ): Promise<ChildResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async predictChild(
    id: string,
    data: PredictChildRequest,
  ): Promise<void> {
    await axios.put(`${this.ACTION_ENDPOINT}/predict/${id}`, data);
  }

  static async deleteChild(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}

