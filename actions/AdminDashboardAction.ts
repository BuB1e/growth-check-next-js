import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  DashboardChartRequestDTO,
  DashboardChartResponseDTO,
} from "@/dto";
// import { getForwardHeaders } from "@/lib/auth/auth-guard";

export class AdminDashboardAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/admin/dashboard/chart";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getDashboardChartData(
    params: DashboardChartRequestDTO = {},
  ): Promise<DashboardChartResponseDTO[]> {
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get<DashboardChartResponseDTO[]>(
      this.ACTION_ENDPOINT,
      {
        headers: activeHeaders,
        params: {
          ...params,
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
          ...(params.locationId && { locationId: Number(params.locationId) }),
          ...(params.minAge && { minAge: Number(params.minAge) }),
          ...(params.maxAge && { maxAge: Number(params.maxAge) }),
          ...(params.sex && { sex: params.sex }),
        },
      },
    );
    return response.data;
  }
}
