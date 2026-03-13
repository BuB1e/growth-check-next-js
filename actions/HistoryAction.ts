

import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildDataResponse,
  ChildTransferRequestResponse,
  LocationCreateRequestResponse,
  PaginatedResponse,
} from "@/dto";
import { ChildDataAction } from "./ChildDataAction";
import { ChildTransferRequestAction } from "./ChildTransferRequestAction";
import { LocationCreateRequestAction } from "./LocationCreateRequestAction";

import type {
  HistoryType,
  HistoryActorRole,
  HistoryStatus,
  HistoryActor,
  HistoryEntry,
  PaginatedHistoryResponse,
} from "@/types";

export class HistoryAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;

  /**
   * Composes history from child-transfer-requests and location-create-requests.
   * Since there is no dedicated /history endpoint, we aggregate from related APIs.
   */
  static async getHistory(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: string,
    orderBy: keyof HistoryEntry = "createdAt",
    orderDirection: "asc" | "desc" = "desc",
  ): Promise<PaginatedHistoryResponse> {
    const [transfersRes, locationRequestsRes] = await Promise.allSettled([
      ChildTransferRequestAction.getRequests({ page: 1, limit: 100 }),
      // Fetch all location requests instead of user "all" to prevent backend 500
      LocationCreateRequestAction.getRequests({
        page: 1,
        limit: 100,
      }),
    ]);

    const entries: HistoryEntry[] = [];

    // Map child transfer requests to history entries
    if (transfersRes.status === "fulfilled") {
      // API currently returns plain array or PaginatedResponse, we normalize it:
      const transfersResponse = transfersRes.value;
      const transfers = Array.isArray(transfersResponse) ? transfersResponse : transfersResponse.data || [];
      
      transfers.forEach((t: ChildTransferRequestResponse) => {
        entries.push({
          id: t.id + 10000, // Offset to avoid ID collisions
          type: "TRANSFER",
          title: `ขอย้ายเด็ก (ID: ${t.childId}) จากเขต ${t.fromLocation} ไปเขต ${t.toLocation}`,
          actor: { role: "Staff", name: t.userId },
          status: t.handledBy ? "APPROVE" : "WAITING",
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          fromLocation: t.fromLocation.toString(),
          toLocation: t.toLocation.toString(),
        });
      });
    }

    // Map location create requests to history entries
    if (locationRequestsRes.status === "fulfilled") {
      const requests = locationRequestsRes.value;
      requests.forEach((r: LocationCreateRequestResponse) => {
        const historyType: HistoryType =
          r.requestStatus === "REJECT"
            ? "LOCATION_REJECT"
            : "LOCATION_APPROVE";
        entries.push({
          id: r.id + 20000, // Offset to avoid ID collisions
          type: historyType,
          title:
            r.requestStatus === "APPROVE"
              ? `อนุมัติสร้าง ${r.locationName}`
              : r.requestStatus === "REJECT"
                ? `ปฏิเสธคำร้องสร้าง ${r.locationName}`
                : `คำร้องขอสร้าง ${r.locationName} (รอดำเนินการ)`,
          actor: {
            role: r.handledBy ? "Admin" : "Staff",
            name: r.handledBy || r.userId,
          },
          status: r.requestStatus,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          locationName: r.locationName,
        });
      });
    }

    // Apply text search filter
    let data: HistoryEntry[] = [...entries];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (h: HistoryEntry) =>
          h.title.toLowerCase().includes(s) ||
          h.actor.name.toLowerCase().includes(s),
      );
    }

    // Apply type filter
    if (type && type !== "ALL") {
      data = data.filter((h: HistoryEntry) => h.type === type);
    }

    // Sort
    data.sort((a, b) => {
      const aVal = a[orderBy] as string | number;
      const bVal = b[orderBy] as string | number;
      if (aVal === bVal) return 0;
      const cmp = aVal < bVal ? -1 : 1;
      return orderDirection === "desc" ? -cmp : cmp;
    });

    // Paginate
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return {
      data: data.slice(start, start + limit),
      meta: { total, page, limit, totalPages },
    };
  }

  static async getHistoryById(id: number): Promise<HistoryEntry | null> {
    // Try to find from composed history
    const result = await this.getHistory(1, 200);
    return result.data.find((h) => h.id === id) || null;
  }
}
