import { EnvConfig } from "@/configs/BackendConfig";
import { VerificationResponse } from "@/dto";

export class VerificationAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/verifications";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getVerifications(): Promise<VerificationResponse[]> {
    const response = await fetch(this.ACTION_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as VerificationResponse[];
  }
}
