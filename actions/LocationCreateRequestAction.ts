import { EnvConfig } from "@/configs/BackendConfig";
import { LocationCreateRequestResponse } from "@/dto";

export class LocationCreateRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/location-create-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getRequests(): Promise<LocationCreateRequestResponse[]> {
    const response = await fetch(this.ACTION_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as LocationCreateRequestResponse[];
  }
}
