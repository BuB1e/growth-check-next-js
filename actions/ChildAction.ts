import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type {
  ChildResponse,
  CreateChildDTO,
  UpdateChildDTO,
  OptionsGetChildrenDTO,
  PaginatedResponseDTO,
} from "@/dto";

type GetChildrenParams = OptionsGetChildrenDTO & {
  page?: number;
  limit?: number;
  minAgeYears?: number | string;
  maxAgeYears?: number | string;
  status?: string;
  sex?: string;
};

type ChildrenPayload =
  | ChildResponse[]
  | PaginatedResponseDTO<ChildResponse>
  | {
      data?: ChildResponse[];
      meta?: Partial<PaginatedResponseDTO<ChildResponse>["meta"]>;
    };

const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const toOptionalNumber = (
  value: number | string | undefined,
): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const getAgeInMonths = (birthDate?: string | Date): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let ageInMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (now.getDate() < birth.getDate()) {
    ageInMonths -= 1;
  }

  return ageInMonths;
};

const applyClientFilters = (
  children: ChildResponse[],
  params: GetChildrenParams,
): ChildResponse[] => {
  const search = (params.q ?? params.firstName)?.toLowerCase().trim();
  const minAgeMonths = toOptionalNumber(params.minAge);
  const maxAgeMonths = toOptionalNumber(params.maxAge);
  const minAgeYears = toOptionalNumber(params.minAgeYears);
  const maxAgeYears = toOptionalNumber(params.maxAgeYears);
  const minAge =
    isDefined(minAgeMonths) || isDefined(minAgeYears)
      ? (minAgeYears ?? 0) * 12 + (minAgeMonths ?? 0)
      : undefined;
  const maxAge =
    isDefined(maxAgeMonths) || isDefined(maxAgeYears)
      ? (maxAgeYears ?? 0) * 12 + (maxAgeMonths ?? 0)
      : undefined;

  return children.filter((child) => {
    if (isNonEmptyString(search)) {
      const firstName = child.firstName?.toLowerCase() ?? "";
      const lastName = child.lastName?.toLowerCase() ?? "";
      if (!firstName.includes(search) && !lastName.includes(search)) {
        return false;
      }
    }

    if (
      isDefined(params.locationId) &&
      child.locationId !== params.locationId
    ) {
      return false;
    }

    if (isNonEmptyString(params.status) && child.status !== params.status) {
      return false;
    }

    // Filter by sex (server-side fallback)
    if (isNonEmptyString(params.sex) && child.sex !== params.sex) {
      return false;
    }

    return true;
  });
};

const paginate = (
  data: ChildResponse[],
  page: number,
  limit: number,
): PaginatedResponseDTO<ChildResponse> => {
  const total = data.length;
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : ChildAction.PAGE_LIMIT;
  const totalPages = Math.ceil(total / safeLimit);

  return {
    data: data.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    },
  };
};

const normalizePaginatedResponse = (
  payload: ChildrenPayload,
  params: Required<Pick<GetChildrenParams, "page" | "limit">> &
    GetChildrenParams,
): PaginatedResponseDTO<ChildResponse> => {
  if (Array.isArray(payload)) {
    const filtered = applyClientFilters(payload, params);
    return paginate(filtered, params.page, params.limit);
  }

  const rawData = Array.isArray(payload?.data) ? payload.data : [];
  const maybeMeta = payload?.meta;

  const normalized: PaginatedResponseDTO<ChildResponse> = {
    data: rawData,
    meta: {
      total:
        typeof maybeMeta?.total === "number" ? maybeMeta.total : rawData.length,
      page: typeof maybeMeta?.page === "number" ? maybeMeta.page : params.page,
      limit:
        typeof maybeMeta?.limit === "number" ? maybeMeta.limit : params.limit,
      totalPages:
        typeof maybeMeta?.totalPages === "number"
          ? maybeMeta.totalPages
          : Math.ceil(
              (typeof maybeMeta?.total === "number"
                ? maybeMeta.total
                : rawData.length) /
                (typeof maybeMeta?.limit === "number"
                  ? maybeMeta.limit
                  : params.limit),
            ),
    },
  };

  return normalized;
};

export class ChildAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/children";
  // If we're on the client, EnvConfig.BACKEND_ENDPOINT is undefined, so we use "/api" prefix for proxying
  static ACTION_ENDPOINT = typeof window === 'undefined' ? (this.BACKEND_ENDPOINT + this.API_ENDPOINT) : ("/api" + this.API_ENDPOINT);
  static PAGE_LIMIT = typeof window === 'undefined' ? EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE : 10;

  static async getChildren(
    params: GetChildrenParams = {},
  ): Promise<PaginatedResponseDTO<ChildResponse>> {
    const page =
      typeof params.page === "number" && params.page > 0 ? params.page : 1;
    const limit =
      typeof params.limit === "number" && params.limit > 0
        ? params.limit
        : ChildAction.PAGE_LIMIT;

    const keyword = isNonEmptyString(params.q) ? params.q.trim() : undefined;
    const hasGlobalNameSearch =
      isNonEmptyString(keyword) &&
      !isNonEmptyString(params.firstName) &&
      !isNonEmptyString(params.lastName);
    const minAgeMonths = toOptionalNumber(params.minAge);
    const maxAgeMonths = toOptionalNumber(params.maxAge);
    const minAgeYears = toOptionalNumber(params.minAgeYears);
    const maxAgeYears = toOptionalNumber(params.maxAgeYears);
    
    const computedMinAge = isDefined(minAgeMonths) || isDefined(minAgeYears)
      ? (minAgeYears ?? 0) * 12 + (minAgeMonths ?? 0)
      : undefined;
      
    const computedMaxAge = isDefined(maxAgeMonths) || isDefined(maxAgeYears)
      ? (maxAgeYears ?? 0) * 12 + (maxAgeMonths ?? 0)
      : undefined;

    const hasClientOnlyFilters =
      isNonEmptyString(params.status) ||
      isNonEmptyString(params.sex);

    const commonParams: OptionsGetChildrenDTO & { sex?: string } = {
      deleteStatus: false,
      locationId:
        typeof params.locationId === "number" && Number.isFinite(params.locationId)
          ? params.locationId
          : undefined,
      createdByUser: isNonEmptyString(params.createdByUser)
        ? params.createdByUser.trim()
        : undefined,
      sex: isNonEmptyString(params.sex) ? params.sex : undefined,
      minAge: computedMinAge,
      maxAge: computedMaxAge,
      haStatus: isNonEmptyString(params.haStatus) ? params.haStatus : undefined,
      waStatus: isNonEmptyString(params.waStatus) ? params.waStatus : undefined,
    };

    const fetchLimit = Math.max(limit, 50);
    const maxPages = 20;

    const fetchAllPages = async (
      extraParams: Partial<OptionsGetChildrenDTO> = {},
    ): Promise<ChildResponse[]> => {
      const aggregated: ChildResponse[] = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages && currentPage <= maxPages) {
        const response = await axios.get<ChildrenPayload>(
          `${this.ACTION_ENDPOINT}/`,
          {
            params: {
              ...commonParams,
              ...extraParams,
              page: currentPage,
              limit: fetchLimit,
            },
          },
        );

        const normalized = normalizePaginatedResponse(response.data, {
          ...params,
          page: currentPage,
          limit: fetchLimit,
        });

        aggregated.push(...normalized.data);
        totalPages =
          normalized.meta.totalPages > 0 ? normalized.meta.totalPages : 1;
        currentPage += 1;
      }

      return aggregated;
    };

    if (hasGlobalNameSearch && keyword) {
      const fetchByNameField = async (
        field: "firstName" | "lastName",
      ): Promise<ChildResponse[]> => {
        return fetchAllPages({ [field]: keyword });
      };

      const [firstNameMatches, lastNameMatches] = await Promise.all([
        fetchByNameField("firstName"),
        fetchByNameField("lastName"),
      ]);

      const uniqueChildren = new Map<number, ChildResponse>();
      [...firstNameMatches, ...lastNameMatches].forEach((child) => {
        uniqueChildren.set(child.id, child);
      });

      const filtered = applyClientFilters(Array.from(uniqueChildren.values()), {
        ...params,
        q: keyword,
      });

      return paginate(filtered, page, limit);
    }

    if (hasClientOnlyFilters) {
      const unfilteredServerData = await fetchAllPages({
        firstName: isNonEmptyString(params.firstName)
          ? params.firstName.trim()
          : undefined,
        lastName: isNonEmptyString(params.lastName)
          ? params.lastName.trim()
          : undefined,
      });

      const filtered = applyClientFilters(unfilteredServerData, params);
      return paginate(filtered, page, limit);
    }

    const requestParams: OptionsGetChildrenDTO & {
      page: number;
      limit: number;
    } = {
      ...commonParams,
      page,
      limit,
      // TODO: Re-enable `q` once backend Prisma string filter for /children is fixed.
      // Backend currently throws 500 for `q` path (`contains` + `mode` in where clause).
      firstName: isNonEmptyString(params.firstName)
        ? params.firstName.trim()
        : isNonEmptyString(params.q)
          ? params.q.trim()
        : undefined,
      lastName: isNonEmptyString(params.lastName)
        ? params.lastName.trim()
        : undefined,
    };

    const response = await axios.get<ChildrenPayload>(
      `${this.ACTION_ENDPOINT}/`,
      {
        params: requestParams,
      },
    );

    return normalizePaginatedResponse(response.data, {
      ...params,
      page,
      limit,
    });
  }

  static async getChildById(id: string): Promise<ChildResponse> {
    const response = await axios.get(`${this.ACTION_ENDPOINT}/${id}`);
    return response.data;
  }

  static async createChild(data: CreateChildDTO): Promise<ChildResponse> {
    const response = await axios.post(`${this.ACTION_ENDPOINT}/`, data);
    return response.data;
  }

  static async updateChild(
    id: string,
    data: UpdateChildDTO,
  ): Promise<ChildResponse> {
    const response = await axios.patch(`${this.ACTION_ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async predictChild(
    id: string,
    model: "arima" | "lstm",
  ): Promise<{ message?: string }> {
    const response = await axios.put(`${this.ACTION_ENDPOINT}/predict/${id}`, {
      model,
    });
    return response.data;
  }

  static async deleteChild(id: string): Promise<void> {
    await axios.delete(`${this.ACTION_ENDPOINT}/${id}`);
  }
}
