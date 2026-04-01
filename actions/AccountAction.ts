import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import { AccountResponse } from "@/dto";

export class AccountAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/accounts";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);

  static async getAccounts(): Promise<AccountResponse[]> {
    void axios;
    throw new Error(
      "AccountAction.getAccounts is not compatible with current backend API contract (/accounts not found in OpenAPI).",
    );
  }
}
