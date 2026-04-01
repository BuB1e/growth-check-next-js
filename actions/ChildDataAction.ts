

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
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/child-data";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getChildDataList(
    params: GetChildDataParams = {},
  ): Promise<ChildDataResponse[]> {
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { 
      params: defaultParams,
      headers: activeHeaders 
    });

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as { data: unknown }).data)) {
      return (response.data as { data: ChildDataResponse[] }).data;
    }

    return [];
  }

  static async getChildDataById(id: string): Promise<ChildDataResponse> {
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders
    });
    return response.data;
  }

  static async getChildDataByChildId(
    childId: number | string,
  ): Promise<ChildDataResponse[]> {
    let activeHeaders = undefined;
    if (typeof window === "undefined") {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/by-child/${childId}`,
      {
        headers: activeHeaders,
      },
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  static async getLatestChildDataByChildId(
    childId: number | string,
  ): Promise<ChildDataResponse[]> {
    let activeHeaders = undefined;
    if (typeof window === "undefined") {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/latest/${childId}`,
      {
        headers: activeHeaders,
      },
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  static async createChildData(
    data: CreateChildDataDTO,
  ): Promise<ChildDataResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async updateChildData(
    id: string,
    data: UpdateChildDataDTO,
  ): Promise<ChildDataResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async deleteChildData(id: string): Promise<void> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
  }
}
