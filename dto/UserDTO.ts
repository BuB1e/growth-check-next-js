// TODO: Aligned with real backend API spec
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

// TODO: Request body for POST /users/
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  teamId?: number;
  image?: string;
}

// TODO: Request body for PATCH /users/{id}
export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  teamId?: number;
  image?: string;
}

// TODO: Query params for GET /users/teams/{teamId}/users
export interface GetUsersByTeamParams {
  page?: number;
  limit?: number;
}
