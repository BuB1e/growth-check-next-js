import { Role, Request_status } from "@/types";

export type HistoryType = 
  | "TRANSFER" 
  | "LOCATION_APPROVE" 
  | "LOCATION_REJECT";

export type HistoryActorRole = Role | "Staff" | "Admin";

export type HistoryStatus = Request_status | "WAITING";

export interface HistoryActor {
  role: HistoryActorRole;
  name: string;
  locationName?: string;
}

export interface HistoryEntry {
  id: number;
  type: HistoryType;
  title: string;
  actor: HistoryActor;
  status: HistoryStatus;
  createdAt: Date;
  updatedAt: Date;
  fromLocation?: string;
  toLocation?: string;
  locationName?: string;
  childFirstName?: string;
  childLastName?: string;
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
