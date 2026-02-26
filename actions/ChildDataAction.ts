import { EnvConfig } from "@/configs/BackendConfig";
import { ChildDataResponse } from "@/dto";

export class ChildDataAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/child-data";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getChildDataMock(childId: number): Promise<ChildDataResponse[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulated data returning multiple records to represent "ครั้งที่ 1", "ครั้งที่ 2", etc.
    const mockData: ChildDataResponse[] = [
      {
        id: 101,
        childId: childId,
        locationId: 1,
        height: 106.0,
        weight: 17.8,
        heightDevelopmentId: 1,
        weightDevelopmentId: 1,
        index: 2,
        heightDate: new Date("2025-02-24"),
        userCreated: "user_01",
        userUpdated: "user_01",
        createdAt: new Date("2025-02-24"),
        updatedAt: new Date("2025-02-24"),
        deleteStatus: false,
        status: "IN_AREA",
        heightDevelopment: {
          id: 1,
          status: "ปกติ",
          metric: "HA",
          detail: null,
          minAge: 0,
          maxAge: 0,
          suggestion: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          deleteStatus: false,
        },
        weightDevelopment: {
          id: 1,
          status: "ปกติ",
          metric: "WA",
          detail: null,
          minAge: 0,
          maxAge: 0,
          suggestion: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          deleteStatus: false,
        },
      },
      {
        id: 102,
        childId: childId,
        locationId: 1,
        height: 107.0,
        weight: 20.8,
        heightDevelopmentId: 2,
        weightDevelopmentId: 2,
        index: 3,
        heightDate: new Date("2025-03-24"),
        userCreated: "user_01",
        userUpdated: "user_01",
        createdAt: new Date("2025-03-24"),
        updatedAt: new Date("2025-03-24"),
        deleteStatus: false,
        status: "IN_AREA",
        heightDevelopment: {
          id: 2,
          status: "มากกว่าเกณฑ์",
          metric: "HA",
          detail: null,
          minAge: 0,
          maxAge: 0,
          suggestion: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          deleteStatus: false,
        },
        weightDevelopment: {
          id: 2,
          status: "มากกว่าเกณฑ์",
          metric: "WA",
          detail: null,
          minAge: 0,
          maxAge: 0,
          suggestion: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          deleteStatus: false,
        },
      },
    ];
    return mockData.sort((a, b) => b.index - a.index); // Usually want newest (highest index) first
  }

  static async getChildData(childId: number): Promise<ChildDataResponse[]> {
    const response = await fetch(`${this.ACTION_ENDPOINT}?childId=${childId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as ChildDataResponse[];
  }
}
