import { create } from "zustand";
import { Role } from "@/types";

interface UserRequestState {
  selectedRole: string;
  selectedTeamId: string;
  setSelectedRole: (role: string) => void;
  setSelectedTeamId: (teamId: string) => void;
  reset: (initialRole: string, initialTeamId: string) => void;
}

export const useUserRequestStore = create<UserRequestState>((set) => ({
  selectedRole: Role.USER,
  selectedTeamId: "",
  setSelectedRole: (role) => set({ selectedRole: role }),
  setSelectedTeamId: (teamId) => set({ selectedTeamId: teamId }),
  reset: (initialRole, initialTeamId) => 
    set({ selectedRole: initialRole, selectedTeamId: initialTeamId }),
}));
