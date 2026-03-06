import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import { DevelopmentResponse } from "@/dto";

export class DevelopmentAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/developments";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getDevelopments(): Promise<DevelopmentResponse[]> {
    const response = await axios.get(this.ACTION_ENDPOINT);
    return response.data as DevelopmentResponse[];
  }
}
