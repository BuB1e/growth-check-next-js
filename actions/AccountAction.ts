import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import { AccountResponse } from "@/dto";

export class AccountAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/accounts";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getAccounts(): Promise<AccountResponse[]> {
    const response = await axios.get(this.ACTION_ENDPOINT);
    return response.data as AccountResponse[];
  }
}
