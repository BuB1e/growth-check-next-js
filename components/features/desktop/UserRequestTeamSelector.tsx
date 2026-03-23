"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamResponse } from "@/dto";
import { useUserRequestStore } from "@/stores/UserRequestStore";

interface UserRequestTeamSelectorProps {
  teams: TeamResponse[];
  isReadOnly?: boolean;
}

export function UserRequestTeamSelector({
  teams,
  isReadOnly = false,
}: UserRequestTeamSelectorProps) {
  const { selectedTeamId, setSelectedTeamId } = useUserRequestStore();

  if (isReadOnly) {
    const teamName = teams.find((t) => t.id.toString() === selectedTeamId)?.name;
    return (
      <div className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium transition-all group-hover:bg-muted/50">
        {teamName || "-"}
      </div>
    );
  }

  return (
    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
      <SelectTrigger className="w-full bg-white border-2 hover:border-primary/50 transition-all font-medium h-[42px]">
        <SelectValue placeholder="เลือกทีม" />
      </SelectTrigger>
      <SelectContent>
        {teams.map((t) => (
          <SelectItem key={t.id} value={t.id.toString()}>
            {t.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
