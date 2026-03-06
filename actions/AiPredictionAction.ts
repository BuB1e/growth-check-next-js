import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import { AiPredictionResponse } from "@/dto";

export class AiPredictionAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/ai-predictions";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getPredictions(): Promise<AiPredictionResponse[]> {
    const response = await axios.get(this.ACTION_ENDPOINT);
    return response.data as AiPredictionResponse[];
  }
}
