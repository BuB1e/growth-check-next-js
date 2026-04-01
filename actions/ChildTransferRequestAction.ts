

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildTransferRequestResponse,
  CreateChildTransferRequestDTO,
  UpdateChildTransferRequestDTO,
  OptionsGetChildTransferRequestsDTO,
  PaginatedResponseDTO,
} from "@/dto";
// import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetChildTransferRequestsParams = OptionsGetChildTransferRequestsDTO & {
  page?: number;
  limit?: number;
};

export class ChildTransferRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/child-transfer-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getRequests(
    params: GetChildTransferRequestsParams = {},
  ): Promise<PaginatedResponseDTO<ChildTransferRequestResponse>> {
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
    id: string,
  ): Promise<ChildTransferRequestResponse> {
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

  static async createRequest(
    data: CreateChildTransferRequestDTO,
  ): Promise<ChildTransferRequestResponse> {
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
    id: string,
    data: UpdateChildTransferRequestDTO,
  ): Promise<ChildTransferRequestResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async deleteRequest(id: string): Promise<void> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
  }
}
