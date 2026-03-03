import { EnvConfig } from "@/configs/BackendConfig";
import { ChildResponse, CreateChildRequest } from "@/dto";

export interface PaginatedChildResponse {
  data: ChildResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// TODO: Replace persistentMockData with real API calls when backend is ready
const persistentMockData: ChildResponse[] = [
  {
    id: 1,
    first_name: "ด.ช. ธนา",
    last_name: "รักดี",
    location_id: 1,
    birth_date: new Date("2020-05-15"),
    gender: "male",
    created_by_user: "user_01",
    created_at: new Date("2023-01-10"),
    updated_at: new Date("2023-01-15T10:30:00Z"),
    status: "In_Area",
    delete_status: false,
  },
  {
    id: 2,
    first_name: "ด.ญ. มะลิ",
    last_name: "ใจบุญ",
    location_id: 1,
    birth_date: new Date("2021-08-20"),
    gender: "female",
    created_by_user: "user_02",
    created_at: new Date("2023-02-14"),
    updated_at: new Date("2023-04-20T09:15:00Z"),
    status: "In_Area",
    delete_status: false,
  },
  {
    id: 3,
    first_name: "ด.ช. สมชาย",
    last_name: "เข็มกลัด",
    location_id: 2,
    birth_date: new Date("2019-11-05"),
    gender: "male",
    created_by_user: "user_01",
    created_at: new Date("2022-10-01"),
    updated_at: new Date("2022-12-05T14:45:00Z"),
    status: "Out_Area",
    delete_status: false,
  },
  {
    id: 4,
    first_name: "ด.ญ. กชกร",
    last_name: "พานิช",
    location_id: 2,
    birth_date: new Date("2022-01-14"),
    gender: "female",
    created_by_user: "user_03",
    created_at: new Date("2023-03-25"),
    updated_at: new Date("2023-06-11T16:20:00Z"),
    status: "Unknown",
    delete_status: false,
  },
  {
    id: 5,
    first_name: "ด.ช. อานนท์",
    last_name: "แสงตะวัน",
    location_id: 3,
    birth_date: new Date("2021-04-12"),
    gender: "male",
    created_by_user: "user_02",
    created_at: new Date("2023-07-10"),
    updated_at: new Date("2023-08-01T11:10:00Z"),
    status: "In_Area",
    delete_status: false,
  },
];

export class ChildAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/children";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getChildren(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    minAge?: string,
    maxAge?: string,
    orderBy: keyof ChildResponse = "updated_at",
    orderDirection: "asc" | "desc" = "desc",
  ): Promise<PaginatedChildResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    let data = [...persistentMockData];

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.first_name.toLowerCase().includes(s) ||
          c.last_name.toLowerCase().includes(s),
      );
    }

    // Status filter
    if (status) {
      data = data.filter((c) => c.status === status);
    }

    // Sorting block
    data.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return orderDirection === "desc" ? -comparison : comparison;
    });

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const pagedData = data.slice(start, start + limit);

    return { data: pagedData, meta: { total, page, limit, totalPages } };
  }

  static async getChildById(id: number): Promise<ChildResponse | null> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return persistentMockData.find((c) => c.id === id) || null;
  }

  static async updateChild(
    id: number,
    payload: {
      firstName: string;
      lastName: string;
      locationId: number;
    },
  ): Promise<ChildResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const index = persistentMockData.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Child not found");
    }

    const updatedChild = {
      ...persistentMockData[index],
      first_name: payload.firstName,
      last_name: payload.lastName,
      location_id: payload.locationId,
      updated_at: new Date(),
    };

    persistentMockData[index] = updatedChild;
    return updatedChild;
  }

  static async createChild(payload: CreateChildRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newChild: ChildResponse = {
      id: persistentMockData.length + 1,
      first_name: payload.firstName,
      last_name: payload.lastName,
      location_id: payload.locationId,
      birth_date: payload.birthDate,
      gender: "male", // TODO: default mock value
      created_by_user: "user_mock",
      created_at: new Date(),
      updated_at: new Date(),
      status: "In_Area",
      delete_status: false,
    };

    persistentMockData.push(newChild);
  }
}
