import { EnvConfig } from "@/configs/BackendConfig";
import { UserResponse } from "@/dto";

export class UserAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/users";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getUsers(params?: {
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    role?: "ADMIN" | "USER" | "HEAD";
  }): Promise<UserResponse[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock Backend Data Response
    let mockUsers: UserResponse[] = [
      {
        id: "mock-id-1",
        email: "admin@example.com",
        firstName: "สมชาย",
        lastName: "ใจดี",
        teamId: 1,
        role: "ADMIN",
        emailVerified: true,
        image: null,
        deleteStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "mock-id-2",
        email: "head@example.com",
        firstName: "สมศรี",
        lastName: "รักดี",
        teamId: 1,
        role: "HEAD",
        emailVerified: true,
        image: null,
        deleteStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "mock-id-3",
        email: "user@example.com",
        firstName: "มานี",
        lastName: "มีนา",
        teamId: 2,
        role: "USER",
        emailVerified: true,
        image: null,
        deleteStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "mock-id-4",
        email: "dev@example.com",
        firstName: "ชูใจ",
        lastName: "ไพศาล",
        teamId: 2,
        role: "HEAD",
        emailVerified: true,
        image: null,
        deleteStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Mock Search filtering
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      mockUsers = mockUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower),
      );
    }

    // Mock Role filtering
    if (params?.role && (params.role as string) !== "ALL") {
      mockUsers = mockUsers.filter((user) => user.role === params.role);
    }

    // Mock Sorting
    if (params?.orderBy) {
      mockUsers.sort((a: UserResponse, b: UserResponse) => {
        const fieldA = String(
          a[params.orderBy! as keyof UserResponse],
        ).toLowerCase();
        const fieldB = String(
          b[params.orderBy! as keyof UserResponse],
        ).toLowerCase();
        if (fieldA < fieldB) return params.orderDirection === "desc" ? 1 : -1;
        if (fieldA > fieldB) return params.orderDirection === "desc" ? -1 : 1;
        return 0;
      });
    }

    return mockUsers;
  }
}
