

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  LocationResponse,
  CreateLocationDTO,
  UpdateLocationDTO,
  OptionsGetAllLocationDTO,
  PaginatedResponseDTO,
} from "@/dto";
import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetLocationsParams = OptionsGetAllLocationDTO & {
  page?: number;
  limit?: number;
};

type LocationsPayload =
  | PaginatedResponseDTO<LocationResponse>
  | LocationResponse[]
  | {
      data?: LocationResponse[];
      meta?: Partial<PaginatedResponseDTO<LocationResponse>["meta"]>;
    };

const normalizeLocationsResponse = (
  payload: LocationsPayload,
  page: number,
  limit: number,
): PaginatedResponseDTO<LocationResponse> => {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: {
        total: payload.length,
        page,
        limit,
        totalPages: Math.ceil(payload.length / limit),
      },
    };
  }

  const data = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta;

  return {
    data,
    meta: {
      total: typeof meta?.total === "number" ? meta.total : data.length,
      page: typeof meta?.page === "number" ? meta.page : page,
      limit: typeof meta?.limit === "number" ? meta.limit : limit,
      totalPages:
        typeof meta?.totalPages === "number"
          ? meta.totalPages
          : Math.ceil(
              (typeof meta?.total === "number" ? meta.total : data.length) /
                (typeof meta?.limit === "number" ? meta.limit : limit),
            ),
    },
  };
};

export class LocationAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/locations";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getLocations(
    params: GetLocationsParams = {},
  ): Promise<PaginatedResponseDTO<LocationResponse>> {
    const page =
      typeof params.page === "number" && params.page > 0 ? params.page : 1;
    const limit =
      typeof params.limit === "number" && params.limit > 0
        ? params.limit
        : EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE;
    const defaultParams = {
      page,
      limit,
      ...params,
    };
    const activeHeaders = typeof window === 'undefined' ? await getForwardHeaders() : undefined;
    const response = await axios.get<LocationsPayload>(`${this.ACTION_ENDPOINT}/`, {
      params: defaultParams,
      headers: activeHeaders,
    });
    return normalizeLocationsResponse(response.data, page, limit);
  }

  static async getLocationById(id: string): Promise<LocationResponse> {
    const activeHeaders = typeof window === 'undefined' ? await getForwardHeaders() : undefined;
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`, {
      headers: activeHeaders
    });
    return response.data;
  }

  static async createLocation(
    data: CreateLocationDTO,
  ): Promise<LocationResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateLocation(
    id: string,
    data: UpdateLocationDTO,
  ): Promise<LocationResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteLocation(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
