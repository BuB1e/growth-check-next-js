

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  AiPredictionResponse,
  CreateAiPredictionDTO,
  UpdateAiPredictionDTO,
  OptionsGetAiPredictionsDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetAiPredictionsParams = OptionsGetAiPredictionsDTO & {
  page?: number;
  limit?: number;
};

export class AiPredictionAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/ai-predictions";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getPredictions(
    params: GetAiPredictionsParams = {},
  ): Promise<PaginatedResponseDTO<AiPredictionResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });

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

  static async getPredictionById(id: string): Promise<AiPredictionResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createPrediction(
    data: CreateAiPredictionDTO,
  ): Promise<AiPredictionResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updatePrediction(
    id: string,
    data: UpdateAiPredictionDTO,
  ): Promise<AiPredictionResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deletePrediction(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
