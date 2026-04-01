import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  GrowthReferenceResponse,
  CreateGrowthReferenceDTO,
  UpdateGrowthReferenceDTO,
  OptionsGetGrowthReferenceDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetGrowthReferenceParams = OptionsGetGrowthReferenceDTO & {
  page?: number;
  limit?: number;
};

export class GrowthReferenceAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/growth-references";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT =
    typeof window === "undefined"
      ? this.BACKEND_ENDPOINT + this.API_ENDPOINT
      : "/api" + this.API_ENDPOINT;

  static async getGrowthReferences(
    params: GetGrowthReferenceParams = {},
  ): Promise<PaginatedResponseDTO<GrowthReferenceResponse>> {
    let activeHeaders = undefined;
    if (typeof window === "undefined") {
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
      headers: activeHeaders,
    });

    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: {
          total: response.data.length,
          page: Number(defaultParams.page) || 1,
          limit: Number(defaultParams.limit) || response.data.length,
          totalPages: 1,
        },
      };
    }

    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data;
    }

    return {
      data: [],
      meta: {
        total: 0,
        page: Number(defaultParams.page) || 1,
        limit: Number(defaultParams.limit) || 10,
        totalPages: 0,
      },
    };
  }

  static async getGrowthReferenceById(id: string): Promise<GrowthReferenceResponse> {
    let activeHeaders = undefined;
    if (typeof window === "undefined") {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async createGrowthReference(
    data: CreateGrowthReferenceDTO,
  ): Promise<GrowthReferenceResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async updateGrowthReference(
    id: string,
    data: UpdateGrowthReferenceDTO,
  ): Promise<GrowthReferenceResponse> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data, {
      headers: activeHeaders,
    });
    return response.data;
  }

  static async deleteGrowthReference(id: string): Promise<void> {
    const activeHeaders =
      typeof window === "undefined"
        ? await (await import("@/lib/auth/header-utils.server")).getForwardHeaders()
        : undefined;
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders,
    });
  }
}
