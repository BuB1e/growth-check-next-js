import { EnvConfig } from "@/configs/BackendConfig";

// Unified history entry combining all activity types
export type HistoryType = "TRANSFER" | "LOCATION_APPROVE" | "LOCATION_REJECT";
export type HistoryActorRole = "Admin" | "Staff" | "Head";
export type HistoryStatus = "APPROVE" | "WAITING" | "REJECT";

export interface HistoryActor {
  role: HistoryActorRole;
  name: string;
  locationName?: string; // The community the actor belongs to
}

export interface HistoryEntry {
  id: number;
  type: HistoryType;
  title: string; // Human-readable headline, e.g. display in list
  actor: HistoryActor;
  status: HistoryStatus;
  createdAt: Date;
  updatedAt: Date;

  // Fields for TRANSFER type
  fromLocation?: string;
  toLocation?: string;
  childFirstName?: string;
  childLastName?: string;

  // Fields for LOCATION_APPROVE/REJECT type
  locationName?: string;
}

export interface PaginatedHistoryResponse {
  data: HistoryEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// TODO: Replace persistentMockHistory with real API calls when backend is ready
const persistentMockHistory: HistoryEntry[] = [
  {
    id: 1,
    type: "LOCATION_APPROVE",
    title: "อนุมัติสร้างชุมชนบ้านอ้อ",
    actor: { role: "Admin", name: "ผู้ดูแลระบบ" },
    status: "APPROVE",
    createdAt: new Date("2025-03-21T08:00:00Z"),
    updatedAt: new Date("2025-03-21T08:00:00Z"),
    locationName: "ชุมชนบ้านอ้อ",
  },
  {
    id: 2,
    type: "TRANSFER",
    title: `ทำเรื่องขอย้าย "น้องสุใจ จริงจัง" จาก "ชุมชนบ้านเก่า" ไป "ชุมชนบ้านอ้อ"`,
    actor: {
      role: "Staff",
      name: "นายสุรชัย มีรัก",
      locationName: "ชุมชนบ้านอ้อ",
    },
    status: "WAITING",
    createdAt: new Date("2025-03-29T10:00:00Z"),
    updatedAt: new Date("2025-03-29T10:00:00Z"),
    fromLocation: "ชุมชนบ้านเก่า",
    toLocation: "ชุมชนบ้านอ้อ",
    childFirstName: "สุใจ",
    childLastName: "จริงจัง",
  },
  {
    id: 3,
    type: "TRANSFER",
    title: `ย้าย "น้องสุใจ จริงจัง" จาก "ชุมชนบ้านเก่า" ไป "ชุมชนบ้านอ้อ"`,
    actor: {
      role: "Head",
      name: "นายมีชัย ปวดหัว",
      locationName: "ชุมชนบ้านอ้อ",
    },
    status: "APPROVE",
    createdAt: new Date("2025-04-01T09:30:00Z"),
    updatedAt: new Date("2025-04-01T09:30:00Z"),
    fromLocation: "ชุมชนบ้านเก่า",
    toLocation: "ชุมชนบ้านอ้อ",
    childFirstName: "สุใจ",
    childLastName: "จริงจัง",
  },
  {
    id: 4,
    type: "LOCATION_APPROVE",
    title: "อนุมัติสร้างชุมชนริมคลอง",
    actor: { role: "Admin", name: "ผู้ดูแลระบบ" },
    status: "APPROVE",
    createdAt: new Date("2025-03-21T11:00:00Z"),
    updatedAt: new Date("2025-03-21T11:00:00Z"),
    locationName: "ชุมชนริมคลอง",
  },
  {
    id: 5,
    type: "TRANSFER",
    title: `ทำเรื่องขอย้าย "น้องดี มีสุข" จาก "ชุมชนสวนธรรม" ไป "ชุมชนริมคลอง"`,
    actor: {
      role: "Staff",
      name: "น.ส.พิม ใจดี",
      locationName: "ชุมชนสวนธรรม",
    },
    status: "APPROVE",
    createdAt: new Date("2025-04-05T14:00:00Z"),
    updatedAt: new Date("2025-04-06T09:00:00Z"),
    fromLocation: "ชุมชนสวนธรรม",
    toLocation: "ชุมชนริมคลอง",
    childFirstName: "ดี",
    childLastName: "มีสุข",
  },
  {
    id: 6,
    type: "LOCATION_REJECT",
    title: "ปฏิเสธคำร้องสร้างชุมชนเขาหลัก",
    actor: { role: "Admin", name: "ผู้ดูแลระบบ" },
    status: "REJECT",
    createdAt: new Date("2025-02-10T09:00:00Z"),
    updatedAt: new Date("2025-02-10T09:00:00Z"),
    locationName: "ชุมชนเขาหลัก",
  },
  {
    id: 7,
    type: "TRANSFER",
    title: `ทำเรื่องขอย้าย "น้องหน่อย น้อยใจ" จาก "ชุมชนท่าน้ำ" ไป "ชุมชนบ้านอ้อ"`,
    actor: {
      role: "Staff",
      name: "นายธนา สุดเท่",
      locationName: "ชุมชนท่าน้ำ",
    },
    status: "REJECT",
    createdAt: new Date("2025-01-20T08:30:00Z"),
    updatedAt: new Date("2025-01-22T10:00:00Z"),
    fromLocation: "ชุมชนท่าน้ำ",
    toLocation: "ชุมชนบ้านอ้อ",
    childFirstName: "หน่อย",
    childLastName: "น้อยใจ",
  },
];

export class HistoryAction {
  // TODO: Wire to real backend endpoint when available
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT;
  static API_ENDPOINT = "/history";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getHistory(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: string,
    orderBy: keyof HistoryEntry = "createdAt",
    orderDirection: "asc" | "desc" = "desc",
  ): Promise<PaginatedHistoryResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    let data = [...persistentMockHistory];

    // Text search: matches title or actor name
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (h) =>
          h.title.toLowerCase().includes(s) ||
          h.actor.name.toLowerCase().includes(s),
      );
    }

    // Type filter
    if (type && type !== "ALL") {
      data = data.filter((h) => h.type === type);
    }

    // Sort
    data.sort((a, b) => {
      const aVal = a[orderBy] as string | Date | number;
      const bVal = b[orderBy] as string | Date | number;
      if (aVal === bVal) return 0;
      const cmp = aVal < bVal ? -1 : 1;
      return orderDirection === "desc" ? -cmp : cmp;
    });

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return {
      data: data.slice(start, start + limit),
      meta: { total, page, limit, totalPages },
    };
  }

  static async getHistoryById(id: number): Promise<HistoryEntry | null> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return persistentMockHistory.find((h) => h.id === id) || null;
  }
}
