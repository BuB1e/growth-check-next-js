// Aligned with real backend API spec (refactored DB — GET list added)
export type UserRole = "ADMIN" | "USER" | "HEAD";

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teamId: number | null;
  role: UserRole;
  emailVerified: boolean;
  image: string | null;
  deleteStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request body for POST /users/
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  teamId?: number;
  image?: string;
}

// Request body for PATCH /users/{id}
export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  teamId?: number;
  image?: string;
}

// Query params for GET /users/
export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  emailVerified?: boolean;
  deleteStatus?: boolean;
}

// Query params for GET /users/teams/{teamId}/users
export interface GetUsersByTeamParams {
  page?: number;
  limit?: number;
}
