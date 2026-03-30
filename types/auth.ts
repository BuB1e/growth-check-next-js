import { Role } from "@/types";

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  teamId?: string | number;
}

export interface Session {
  user: UserSession;
  session?: any;
}
