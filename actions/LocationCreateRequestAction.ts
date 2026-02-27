import { EnvConfig } from "@/configs/BackendConfig";
import { LocationCreateRequestResponse } from "@/dto";

// TODO: Replace persistentMockData with real API calls when backend is ready
const persistentMockData: LocationCreateRequestResponse[] = [
  {
    id: 1,
    userId: "user_01",
    locationName: "ชุมชนบ้านใหม่",
    locationMap: "https://maps.google.com/?q=13.874,100.521",
    province: "นนทบุรี",
    district: "ปากเกร็ด",
    sub_district: "ปากเกร็ด",
    zip_code: "11120",
    status: "WAITING",
    handledBy: "",
    createdAt: new Date("2024-01-15T08:30:00Z"),
    updatedAt: new Date("2024-01-15T08:30:00Z"),
    deleteStatus: false,
  },
  {
    id: 2,
    userId: "user_02",
    locationName: "ชุมชนริมคลอง",
    locationMap: "https://maps.google.com/?q=13.882,100.510",
    province: "นนทบุรี",
    district: "บางใหญ่",
    sub_district: "บ้านใหม่",
    zip_code: "11140",
    status: "APPROVE",
    handledBy: "admin_01",
    createdAt: new Date("2023-11-20T10:00:00Z"),
    updatedAt: new Date("2023-11-25T14:00:00Z"),
    deleteStatus: false,
  },
  {
    id: 3,
    userId: "user_03",
    locationName: "หมู่บ้านเขียวขจี",
    locationMap: "https://maps.google.com/?q=13.860,100.535",
    province: "นนทบุรี",
    district: "เมืองนนทบุรี",
    sub_district: "สวนใหญ่",
    zip_code: "11000",
    status: "REJECT",
    handledBy: "admin_02",
    createdAt: new Date("2023-09-05T09:15:00Z"),
    updatedAt: new Date("2023-09-10T11:30:00Z"),
    deleteStatus: false,
  },
  {
    id: 4,
    userId: "user_04",
    locationName: "ชุมชนท่าน้ำ",
    locationMap: "https://maps.google.com/?q=13.895,100.498",
    province: "นนทบุรี",
    district: "ปากเกร็ด",
    sub_district: "คลองพระอุดม",
    zip_code: "11120",
    status: "WAITING",
    handledBy: "",
    createdAt: new Date("2024-02-10T13:45:00Z"),
    updatedAt: new Date("2024-02-10T13:45:00Z"),
    deleteStatus: false,
  },
  {
    id: 5,
    userId: "user_01",
    locationName: "ชุมชนสวนธรรม",
    locationMap: "https://maps.google.com/?q=13.870,100.515",
    province: "นนทบุรี",
    district: "บางกรวย",
    sub_district: "วัดชลอ",
    zip_code: "11130",
    status: "APPROVE",
    handledBy: "admin_01",
    createdAt: new Date("2023-12-01T07:00:00Z"),
    updatedAt: new Date("2023-12-05T09:00:00Z"),
    deleteStatus: false,
  },
];

export interface PaginatedRequestResponse {
  data: LocationCreateRequestResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class LocationCreateRequestAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/location-create-requests";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getRequests(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    orderBy: keyof LocationCreateRequestResponse = "updatedAt",
    orderDirection: "asc" | "desc" = "desc",
  ): Promise<PaginatedRequestResponse> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    let data = [...persistentMockData];

    // Search filter: matches locationName, district, sub_district
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.locationName.toLowerCase().includes(s) ||
          r.sub_district.toLowerCase().includes(s) ||
          r.district.toLowerCase().includes(s) ||
          r.province.toLowerCase().includes(s),
      );
    }

    // Status filter
    if (status && status !== "ALL") {
      data = data.filter((r) => r.status === status);
    }

    // Sorting
    data.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal === bVal) return 0;
      const cmp = aVal < bVal ? -1 : 1;
      return orderDirection === "desc" ? -cmp : cmp;
    });

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const pagedData = data.slice(start, start + limit);

    return { data: pagedData, meta: { total, page, limit, totalPages } };
  }

  static async getRequestById(
    id: number,
  ): Promise<LocationCreateRequestResponse | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return persistentMockData.find((r) => r.id === id) || null;
  }
}
