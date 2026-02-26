export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teamId: number | null;
  role: "ADMIN" | "USER" | "HEAD";
  emailVerified: boolean;
  image: string | null;
  deleteStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}
