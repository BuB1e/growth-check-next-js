// ─── Enums ────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = "ADMIN",
  HEAD = "HEAD",
  STAFF = "STAFF",
}

export enum RequestStatus {
  WAITING = "WAITING",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

export enum ChildStatus {
  IN_AREA = "In_Area",
  OUT_AREA = "Out_Area",
  UNKNOWN = "Unknown",
  DIED = "Died",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

// ─── Interfaces ───────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // computed full name
  role: UserRole;
  teamId: number | null;
  status: boolean;
}

export interface Child {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  locationId: number;
  status: ChildStatus;
}

export interface ChildIndex {
  id: number;
  fullName: string;
  ageMonths: number;
  status: string;
}

export interface Measurement {
  id: number;
  childId: number;
  height: number;
  weight: number;
  date: string;
  recordedBy: string;
}

export interface MeasurementInput {
  height: number;
  weight: number;
  date: string;
}

export interface UserRegistrationRequest {
  id: string;
  type: "UserRegistration";
  userId: string;
  requester: string;
  status: RequestStatus;
  rejectReason: string | null;
  updatedAt: string;
}

export interface LocationCreationRequest {
  id: number;
  type: "LocationCreation";
  userId: string;
  locationName: string;
  requester: string;
  status: RequestStatus;
}

export type AppRequest = UserRegistrationRequest | LocationCreationRequest;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AreaStats {
  totalChildren: number;
  malnutritionRate: number;
}
