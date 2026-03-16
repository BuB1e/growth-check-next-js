

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
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/ai-predictions";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getPredictions(
    params: GetAiPredictionsParams = {},
  ): Promise<PaginatedResponseDTO<AiPredictionResponse>> {
    const defaultParams = {
      page: 1,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params: defaultParams });
    return response.data;
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
