"use server";

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  AiPredictionResponse,
  CreateAiPredictionRequest,
  UpdateAiPredictionRequest,
  GetAiPredictionsParams,
  PaginatedResponse,
} from "@/dto";

export class AiPredictionAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/ai-predictions";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  // TODO: GET /ai-predictions/ — list with query params
  static async getPredictions(
    params?: GetAiPredictionsParams,
  ): Promise<PaginatedResponse<AiPredictionResponse>> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/`, { params });
    return response.data;
  }

  // TODO: GET /ai-predictions/{id}
  static async getPredictionById(id: string): Promise<AiPredictionResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  // TODO: POST /ai-predictions/
  static async createPrediction(
    data: CreateAiPredictionRequest,
  ): Promise<AiPredictionResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  // TODO: PATCH /ai-predictions/{id}
  static async updatePrediction(
    id: string,
    data: UpdateAiPredictionRequest,
  ): Promise<AiPredictionResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  // TODO: DELETE /ai-predictions/{id}
  static async deletePrediction(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
