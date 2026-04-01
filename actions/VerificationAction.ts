import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import { VerificationResponse } from "@/dto";

export class VerificationAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/verifications";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getVerifications(): Promise<VerificationResponse[]> {
    void axios;
    throw new Error(
      "VerificationAction.getVerifications is not compatible with current backend API contract (/verifications not found in OpenAPI).",
    );
  }
}
