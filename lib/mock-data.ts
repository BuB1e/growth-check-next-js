import type {
  ChildIndex,
  User,
  AppRequest,
  AreaStats,
  PaginatedResponse,
  Measurement,
} from "@/types";
import { RequestStatus, UserRole, ChildStatus, Gender } from "@/types";

// ─── Mock Users ─────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: "u1",
    email: "admin@growthcheck.com",
    firstName: "สมชาย",
    lastName: "จันทร์",
    name: "สมชาย จันทร์",
    role: UserRole.ADMIN,
    teamId: null,
    status: true,
  },
  {
    id: "u2",
    email: "head@growthcheck.com",
    firstName: "สมหญิง",
    lastName: "ศรี",
    name: "สมหญิง ศรี",
    role: UserRole.HEAD,
    teamId: 1,
    status: true,
  },
  {
    id: "u3",
    email: "staff@growthcheck.com",
    firstName: "สมศักดิ์",
    lastName: "ดี",
    name: "สมศักดิ์ ดี",
    role: UserRole.STAFF,
    teamId: 1,
    status: true,
  },
  {
    id: "u4",
    email: "staff2@growthcheck.com",
    firstName: "สมใจ",
    lastName: "รัก",
    name: "สมใจ รัก",
    role: UserRole.STAFF,
    teamId: 2,
    status: true,
  },
  {
    id: "u5",
    email: "disabled@growthcheck.com",
    firstName: "สม",
    lastName: "ปอง",
    name: "สม ปอง",
    role: UserRole.STAFF,
    teamId: 1,
    status: false,
  },
];

// ─── Mock Children ──────────────────────────────────────────

export const mockChildren: ChildIndex[] = [
  { id: 1, fullName: "น้องมะลิ สวย", ageMonths: 24, status: "In_Area" },
  { id: 2, fullName: "น้องกล้า ดี", ageMonths: 36, status: "In_Area" },
  { id: 3, fullName: "น้องแก้ว ใส", ageMonths: 18, status: "In_Area" },
  { id: 4, fullName: "น้องเก่ง มาก", ageMonths: 48, status: "Out_Area" },
  { id: 5, fullName: "น้องจ๋า รัก", ageMonths: 12, status: "In_Area" },
  { id: 6, fullName: "น้องใจ ดี", ageMonths: 30, status: "In_Area" },
  { id: 7, fullName: "น้องฝน พรำ", ageMonths: 42, status: "Unknown" },
  { id: 8, fullName: "น้องดาว สว่าง", ageMonths: 60, status: "In_Area" },
  { id: 9, fullName: "น้องลม พัด", ageMonths: 15, status: "In_Area" },
  { id: 10, fullName: "น้องน้ำ ใส", ageMonths: 9, status: "In_Area" },
  { id: 11, fullName: "น้องดิน ดี", ageMonths: 20, status: "In_Area" },
  { id: 12, fullName: "น้องไฟ แรง", ageMonths: 33, status: "In_Area" },
];

// ─── Mock Requests ──────────────────────────────────────────

export const mockRequests: AppRequest[] = [
  {
    id: "r1",
    type: "UserRegistration",
    userId: "u-new-1",
    requester: "กมล เขียว",
    status: RequestStatus.WAITING,
    rejectReason: null,
    updatedAt: "2026-02-15T10:30:00Z",
  },
  {
    id: "r2",
    type: "UserRegistration",
    userId: "u-new-2",
    requester: "วิไล แดง",
    status: RequestStatus.WAITING,
    rejectReason: null,
    updatedAt: "2026-02-16T09:00:00Z",
  },
  {
    id: 3,
    type: "LocationCreation",
    userId: "u3",
    locationName: "ชุมชนหมู่ 5 บ้านโนนสูง",
    requester: "สมศักดิ์ ดี",
    status: RequestStatus.WAITING,
  },
  {
    id: "r4",
    type: "UserRegistration",
    userId: "u-new-3",
    requester: "ประเสริฐ ทอง",
    status: RequestStatus.APPROVE,
    rejectReason: null,
    updatedAt: "2026-02-14T14:00:00Z",
  },
];

// ─── Mock Stats ─────────────────────────────────────────────

export const mockStats: AreaStats = {
  totalChildren: 128,
  malnutritionRate: 4.7,
};

// ─── Mock Measurements ──────────────────────────────────────

export const mockMeasurements: Measurement[] = [
  {
    id: 1,
    childId: 1,
    height: 85.5,
    weight: 11.2,
    date: "2026-02-10T09:00:00Z",
    recordedBy: "u3",
  },
  {
    id: 2,
    childId: 1,
    height: 83.2,
    weight: 10.8,
    date: "2026-01-10T09:00:00Z",
    recordedBy: "u3",
  },
];

// ─── Helper: Paginate ───────────────────────────────────────

export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10,
): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    meta: { page, limit, total: items.length },
  };
}
