

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  LocationResponse,
  CreateLocationRequest,
  UpdateLocationRequest,
} from "@/dto";

export class LocationAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/locations";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getLocationById(id: string): Promise<LocationResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createLocation(
    data: CreateLocationRequest,
  ): Promise<LocationResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateLocation(
    id: string,
    data: UpdateLocationRequest,
  ): Promise<LocationResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteLocation(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
