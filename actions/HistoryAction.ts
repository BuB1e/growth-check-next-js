import {
  ChildTransferRequestResponse,
  LocationCreateRequestResponse,
} from "@/dto";
import { EnvConfig } from "@/configs/BackendConfig";
import { ChildTransferRequestAction } from "./ChildTransferRequestAction";
import { LocationCreateRequestAction } from "./LocationCreateRequestAction";
import { Request_status, Role } from "@/types";

import type {
  HistoryType,
  HistoryEntry,
  PaginatedHistoryResponse,
} from "@/dto";

export class HistoryAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static PAGE_LIMIT =
    typeof window === "undefined"
      ? EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE
      : 10;

  // Constants for magic numbers and strings
  private static readonly TRANSFER_ID_OFFSET = 10000;
  private static readonly LOCATION_ID_OFFSET = 20000;
  private static readonly TYPE_TRANSFER = "TRANSFER" as HistoryType;
  private static readonly TYPE_LOCATION_APPROVE =
    "LOCATION_APPROVE" as HistoryType;
  private static readonly TYPE_LOCATION_REJECT =
    "LOCATION_REJECT" as HistoryType;

  private static async fetchAllTransferRequests(): Promise<
    ChildTransferRequestResponse[]
  > {
    const all: ChildTransferRequestResponse[] = [];
    let page = 1;

    while (true) {
      const res = await ChildTransferRequestAction.getRequests({
        page,
        limit: this.PAGE_LIMIT,
      });
      const items = Array.isArray(res?.data) ? res.data : [];
      all.push(...items);

      if (!items.length || page >= (res?.meta?.totalPages ?? page)) {
        break;
      }

      page += 1;
    }

    return all;
  }

  private static async fetchAllLocationRequests(): Promise<
    LocationCreateRequestResponse[]
  > {
    const all: LocationCreateRequestResponse[] = [];
    let page = 1;

    while (true) {
      const res = await LocationCreateRequestAction.getRequests({
        page,
        limit: this.PAGE_LIMIT,
      });
      const items = Array.isArray(res?.data) ? res.data : [];
      all.push(...items);

      if (!items.length || page >= (res?.meta?.totalPages ?? page)) {
        break;
      }

      page += 1;
    }

    return all;
  }

  /**
   * Composes history from child-transfer-requests and location-create-requests.
   * Since there is no dedicated /history endpoint, we aggregate from related APIs.
   */
  static async getHistory(
    page: number = 1,
    limit: number = this.PAGE_LIMIT,
    search?: string,
    type?: string,
    orderBy: keyof HistoryEntry = "createdAt",
    orderDirection: "asc" | "desc" = "desc",
  ): Promise<PaginatedHistoryResponse> {
    const [transfersRes, locationRequestsRes] = await Promise.allSettled([
      this.fetchAllTransferRequests(),
      this.fetchAllLocationRequests(),
    ]);

    const entries: HistoryEntry[] = [];

    // Map child transfer requests to history entries
    if (transfersRes.status === "fulfilled") {
      transfersRes.value.forEach((t: ChildTransferRequestResponse) => {
        entries.push({
          id: t.id + this.TRANSFER_ID_OFFSET,
          type: this.TYPE_TRANSFER,
          title: `ขอย้ายเด็ก (ID: ${t.childId}) จากเขต ${t.fromLocation} ไปเขต ${t.toLocation}`,
          actor: { role: Role.USER, name: t.userId },
          status: t.handledBy ? Request_status.APPROVE : Request_status.WAITING,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          fromLocation: t.fromLocation.toString(),
          toLocation: t.toLocation.toString(),
        });
      });
    }

    // Map location create requests to history entries
    if (locationRequestsRes.status === "fulfilled") {
      locationRequestsRes.value.forEach((r: LocationCreateRequestResponse) => {
        const historyType: HistoryType =
          r.requestStatus === Request_status.REJECT
            ? this.TYPE_LOCATION_REJECT
            : this.TYPE_LOCATION_APPROVE;
        entries.push({
          id: r.id + this.LOCATION_ID_OFFSET,
          type: historyType,
          title:
            r.requestStatus === Request_status.APPROVE
              ? `อนุมัติสร้าง ${r.locationName}`
              : r.requestStatus === Request_status.REJECT
                ? `ปฏิเสธคำร้องสร้าง ${r.locationName}`
                : `คำร้องขอสร้าง ${r.locationName} (รอดำเนินการ)`,
          actor: {
            role: r.handledBy ? Role.ADMIN : Role.USER,
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
    const result = await this.getHistory(1, Number.MAX_SAFE_INTEGER);
    return result.data.find((h) => h.id === id) || null;
  }
}
