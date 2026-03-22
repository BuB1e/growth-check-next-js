import { Request_status } from "@/types";

export interface UserCreateStatusResponse {
  id: number;
  userId: string;
  requestStatus: Request_status;
  rejectReason?: string | null;
  updatedBy?: string| null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserCreateStatusDto {
  userId: string;
}

export interface UpdateUserCreateStatusDto {
  requestStatus?: Request_status | string;
  rejectReason?: string;
  updatedBy?: string;
  role?: string;
  teamId?: number;
}

export interface OptionsGetUserCreateStatusDTO {
  q?: string;
  status?: string;
  role?: string;
  deleted?: boolean;
}

