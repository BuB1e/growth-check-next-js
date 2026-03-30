import { Role } from "@/types";

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  teamId?: string | number;
  provider: string;
}

export interface Session {
  user: UserSession;
  session?: any;
}
