import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import { SessionResponse } from "@/dto";

export class SessionAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/sessions";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getSessions(): Promise<SessionResponse[]> {
    const response = await axios.get(this.ACTION_ENDPOINT);
    return response.data as SessionResponse[];
  }
}
