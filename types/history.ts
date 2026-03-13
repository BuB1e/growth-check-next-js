export type HistoryType = "TRANSFER" | "LOCATION_APPROVE" | "LOCATION_REJECT";
export type HistoryActorRole = "Admin" | "Staff" | "Head";
export type HistoryStatus = "APPROVE" | "WAITING" | "REJECT";

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
  createdAt: string;
  updatedAt: string;

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
