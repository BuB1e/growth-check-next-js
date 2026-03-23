"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role, RoleTH } from "@/types";
import { useUserRequestStore } from "@/stores/UserRequestStore";

interface UserRequestRoleSelectorProps {
  initialRole: string;
  initialTeamId?: string;
  isReadOnly?: boolean;
}

export function UserRequestRoleSelector({
  initialRole,
  isReadOnly = false,
  initialTeamId = "",
}: UserRequestRoleSelectorProps) {
  const { selectedRole, setSelectedRole, reset } = useUserRequestStore();

  useEffect(() => {
    reset(initialRole, initialTeamId);
  }, [initialRole, initialTeamId, reset]);

  if (isReadOnly) {
    return (
      <div className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium transition-all group-hover:bg-muted/50">
        {selectedRole === Role.USER ? RoleTH.USER : RoleTH.HEAD}
      </div>
    );
  }

  return (
    <Select value={selectedRole} onValueChange={setSelectedRole}>
      <SelectTrigger className="w-full bg-white border-2 hover:border-primary/50 transition-all font-medium h-[42px]">
        <SelectValue placeholder="เลือกบทบาท" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={Role.USER}>
          {RoleTH.USER} (Staff)
        </SelectItem>
        <SelectItem value={Role.HEAD}>
          {RoleTH.HEAD} (Head)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
