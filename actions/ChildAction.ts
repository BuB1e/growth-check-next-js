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

export class ChildAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/children";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getChildrenMock(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    minAge?: string,
    maxAge?: string,
    heightDev?: string,
    weightDev?: string,
    locationId?: string,
  ): Promise<PaginatedChildResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    let mockData: ChildResponse[] = [
      {
        id: 1,
        first_name: "ด.ช. ธนา",
        last_name: "รักดี",
        location_id: 1,
        birth_date: new Date("2020-05-15"),
        gender: "male",
        created_by_user: "user_01",
        created_at: new Date(),
        updated_at: new Date(),
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
        created_at: new Date(),
        updated_at: new Date(),
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
        created_at: new Date(),
        updated_at: new Date(),
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
        created_at: new Date(),
        updated_at: new Date(),
        status: "Unknown",
        delete_status: false,
      },
    ];

    if (search) {
      const s = search.toLowerCase();
      mockData = mockData.filter(
        (c) =>
          c.first_name.toLowerCase().includes(s) ||
          c.last_name.toLowerCase().includes(s),
      );
    }
    if (status) {
      mockData = mockData.filter((c) => c.status === status);
    }
    if (locationId) {
      mockData = mockData.filter((c) => c.location_id === parseInt(locationId));
    }

    const total = mockData.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = mockData.slice(start, start + limit);

    return { data, meta: { total, page, limit, totalPages } };
  }

  static async getChildren(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    minAge?: string,
    maxAge?: string,
    heightDev?: string,
    weightDev?: string,
    locationId?: string,
  ): Promise<PaginatedChildResponse> {
    const url = new URL(this.ACTION_ENDPOINT);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());
    if (search) url.searchParams.append("search", search);
    if (status) url.searchParams.append("status", status);
    if (minAge) url.searchParams.append("minAge", minAge);
    if (maxAge) url.searchParams.append("maxAge", maxAge);
    if (heightDev) url.searchParams.append("heightDev", heightDev);
    if (weightDev) url.searchParams.append("weightDev", weightDev);
    if (locationId) url.searchParams.append("locationId", locationId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch children");

    const data = await response.json();
    return data as PaginatedChildResponse;
  }

  static async createChild(payload: CreateChildRequest): Promise<void> {
    const url = new URL(this.ACTION_ENDPOINT);

    // Using mock timeout until API is strictly available
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // TODO: Uncomment when real endpoint is ready to accept this structure

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create child: ${errText}`);
    }
  }

  static async getChildByIdMock(id: number): Promise<ChildResponse | null> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockData: ChildResponse[] = [
      { id: 1, first_name: "ด.ช. ธนา", last_name: "รักดี", location_id: 1, birth_date: new Date("2020-05-15"), gender: "male", created_by_user: "user_01", created_at: new Date(), updated_at: new Date(), status: "In_Area", delete_status: false },
      { id: 2, first_name: "ด.ญ. มะลิ", last_name: "ใจบุญ", location_id: 1, birth_date: new Date("2021-08-20"), gender: "female", created_by_user: "user_02", created_at: new Date(), updated_at: new Date(), status: "In_Area", delete_status: false },
    ];

    return mockData.find(c => c.id === id) || mockData[0]; // fallback to first item for testing
  }

  static async getChildById(id: number): Promise<ChildResponse> {
    const response = await fetch(`${this.ACTION_ENDPOINT}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch child details");

    const data = await response.json();
    return data as ChildResponse;
  }
}
