import { EnvConfig } from "@/configs/BackendConfig";
import { UserCreateStatusResponse } from "@/dto";

export class UserCreateStatusAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/user-create-statuses";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getStatuses(): Promise<UserCreateStatusResponse[]> {
    const response = await fetch(this.ACTION_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as UserCreateStatusResponse[];
  }
}
