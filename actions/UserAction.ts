
import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  OptionsGetAllUserDTO,
  PaginatedResponseDTO,
} from "@/dto";
// import { getForwardHeaders } from "@/lib/auth/auth-guard";

type GetUsersParams = OptionsGetAllUserDTO & {
  page?: number;
  limit?: number;
};

type GetUsersByTeamParams = OptionsGetAllUserDTO & {
  page?: number;
  limit?: number;
};

type UsersPayload =
  | UserResponse[]
  | PaginatedResponseDTO<UserResponse>;

const normalizeUsersList = (payload: UsersPayload): UserResponse[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

export class UserAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/users";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getUsers(
    params: GetUsersParams = {},
    headers?: Record<string, string>,
  ): Promise<UserResponse[]> {
    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const defaultParams = {
      page: 1,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
      ...params,
    };
    const response = await axios.get<UsersPayload>(`${this.ACTION_ENDPOINT}/`, {
      params: defaultParams,
      headers: activeHeaders,
    });
    return normalizeUsersList(response.data);
  }

  static async getUsersByTeam(
    teamId: number,
    params: GetUsersByTeamParams = {},
    headers?: Record<string, string>,
  ): Promise<UserResponse[]> {
    const res = await this.getUsersByTeamPaginated(teamId, params, headers);
    return res.data;
  }

  static async getUsersByTeamPaginated(
    teamId: number,
    params: GetUsersByTeamParams = {},
    headers?: Record<string, string>,
  ): Promise<PaginatedResponseDTO<UserResponse>> {
    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const page = typeof params.page === 'number' && params.page > 0 ? params.page : 1;
    const limit = typeof params.limit === 'number' && params.limit > 0 ? params.limit : EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE;
    
    const defaultParams = {
      page,
      limit,
      ...params,
    };
    const response = await axios.get<UsersPayload>(
      `${this.ACTION_ENDPOINT}/teams/${teamId}/users`,
      {
        params: defaultParams,
        headers: activeHeaders
      },
    );
    
    // Normalize to PaginatedResponseDTO
    const payload = response.data;
    if (Array.isArray(payload)) {
      return {
        data: payload,
        meta: {
          total: payload.length,
          page,
          limit,
          totalPages: Math.ceil(payload.length / limit),
        }
      };
    }
    
    if (payload && "data" in payload && Array.isArray(payload.data)) {
      const p = payload as PaginatedResponseDTO<UserResponse>;
      return {
        data: p.data,
        meta: {
          total: p.meta?.total ?? p.data.length,
          page: p.meta?.page ?? page,
          limit: p.meta?.limit ?? limit,
          totalPages: p.meta?.totalPages ?? Math.ceil((p.meta?.total ?? p.data.length) / (p.meta?.limit ?? limit)),
        }
      };
    }

    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 0 }
    };
  }

  static async getUserById(id: string, headers?: Record<string, string>): Promise<UserResponse> {
    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getById/${id}`,
      { headers: activeHeaders }
    );
    return response.data;
  }

  static async getUserByEmail(email: string, headers?: Record<string, string>): Promise<UserResponse> {
    let activeHeaders: Record<string, string> | undefined = headers;
    if (!activeHeaders && typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getByEmail/${email}`,
      { headers: activeHeaders }
    );
    return response.data;
  }

  static async createUser(data: CreateUserDto): Promise<UserResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
