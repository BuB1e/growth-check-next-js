import { EnvConfig } from "@/configs/BackendConfig";
import { UserResponse } from "@/dto";

export class UserAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/users";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getUsers(): Promise<UserResponse[]> {
    const response = await fetch(this.ACTION_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as UserResponse[];
  }
}
