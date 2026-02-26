import { EnvConfig } from "@/configs/BackendConfig";
import { ChildTransferRequestResponse } from "@/dto";

export class ChildTransferRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/child-transfer-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getRequests(): Promise<ChildTransferRequestResponse[]> {
    const response = await fetch(this.ACTION_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as ChildTransferRequestResponse[];
  }
}
