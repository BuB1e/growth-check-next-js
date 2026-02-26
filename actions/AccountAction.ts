import { EnvConfig } from "@/configs/BackendConfig";
import { AccountResponse } from "@/dto";

export class AccountAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/accounts";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getAccounts(): Promise<AccountResponse[]> {
    const response = await fetch(this.ACTION_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as AccountResponse[];
  }
}
