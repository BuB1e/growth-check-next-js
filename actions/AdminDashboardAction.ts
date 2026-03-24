import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type { DashboardChartResponseDTO, DashboardSummaryResponseDTO, DashboardChartFilterDTO } from "@/dto";
// import { getForwardHeaders } from "@/lib/auth/auth-guard";

export class AdminDashboardAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/admin/dashboard";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getDashboardSummary(): Promise<DashboardSummaryResponseDTO> {
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/summary`,
      { headers: activeHeaders }
    );
    return response.data;
  }

  static async getDashboardChartData(
    params: DashboardChartFilterDTO = {},
  ): Promise<DashboardChartResponseDTO[]> {
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }

    // Convert Date to ISO string for query params
    const queryParams: Record<string, string | number | boolean | undefined> = {
      ...params,
      ...(params.startDate && { startDate: params.startDate.toISOString() }),
      ...(params.endDate && { endDate: params.endDate.toISOString() }),
    } as Record<string, string | number | boolean | undefined>;

    const response = await axios.get<DashboardChartResponseDTO[]>(
      `${this.ACTION_ENDPOINT}/chart`,
      {
        headers: activeHeaders,
        params: queryParams,
      },
    );
    return response.data;
  }
}
