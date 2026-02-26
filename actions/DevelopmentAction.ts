import { EnvConfig } from "@/configs/BackendConfig";
import { DevelopmentResponse } from "@/dto";

export class DevelopmentAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/developments";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getDevelopments(): Promise<DevelopmentResponse[]> {
    const response = await fetch(this.ACTION_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as DevelopmentResponse[];
  }
}
