

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  LocationCreateRequestResponse,
  CreateLocationRequestDTO,
  UpdateLocationRequestDTO,
  OptionsLocationCreateRequestDTO,
  PaginatedResponseDTO,
} from "@/dto";
// import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetLocationCreateRequestsParams = OptionsLocationCreateRequestDTO & {
  page?: number;
  limit?: number;
};

export class LocationCreateRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/location-create-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getRequests(
    params: GetLocationCreateRequestsParams = {},
  ): Promise<PaginatedResponseDTO<LocationCreateRequestResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };

    let activeHeaders: Record<string, string> | undefined = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }

    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, {
      params: defaultParams,
      headers: activeHeaders
    });
    return response.data;
  }

  static async getRequestById(
    id: number,
  ): Promise<LocationCreateRequestResponse> {
    let activeHeaders: Record<string, string> | undefined = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }

    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders
    });
    return response.data;
  }

  static async getRequestsByUserId(
    userId: string,
    params: GetLocationCreateRequestsParams = {},
  ): Promise<PaginatedResponseDTO<LocationCreateRequestResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };

    let activeHeaders: Record<string, string> | undefined = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }

    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/user/${userId}`,
      {
        params: defaultParams,
        headers: activeHeaders
      },
    );
    return response.data;
  }

  static async createRequest(
    data: CreateLocationRequestDTO,
  ): Promise<LocationCreateRequestResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async updateRequest(
    id: number,
    data: UpdateLocationRequestDTO,
  ): Promise<LocationCreateRequestResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async deleteRequest(id: number): Promise<void> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
  }
}
