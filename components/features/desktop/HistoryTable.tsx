"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  HistoryEntry,
  HistoryActor,
  PaginatedHistoryResponse,
} from "@/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { formatBE } from "@/lib/date-utils";

interface HistoryTableProps {
  rawData: PaginatedHistoryResponse;
}

function ActorLabel({ actor }: { actor: HistoryActor }) {
  if (actor.role === "Admin") return <span>{actor.role}</span>;
  return (
    <span className="text-muted-foreground text-sm truncate max-w-[220px] block">
      {actor.role} - {actor.name}
      {actor.locationName ? ` - ${actor.locationName}` : ""}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "APPROVE")
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "REJECT") return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-yellow-500" />;
}

function SortBtn({
  label,
  col,
  onSort,
}: {
  label: string;
  col: keyof HistoryEntry;
  onSort: (col: keyof HistoryEntry) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(col)}
      className="-ml-3 h-8"
    >
      {label}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  );
}

export function HistoryTable({ rawData }: HistoryTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get("type") || "ALL",
  );

  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams({ search: searchQuery || null, page: "1" });
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    updateURLParams({ type: val === "ALL" ? null : val, page: "1" });
  };

  const handleSort = (col: keyof HistoryEntry) => {
    const current = searchParams.get("orderBy");
    const dir = searchParams.get("orderDirection");
    const newDir = current === col && dir === "desc" ? "asc" : "desc";
    updateURLParams({ orderBy: col, orderDirection: newDir });
  };

  const currentPage = rawData.meta.page;
  const totalPages = rawData.meta.totalPages;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาหัวข้อ หรือชื่อผู้ดำเนินการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-72"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            ค้นหา
          </Button>
        </form>

        <Select value={typeFilter} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="ทุกประเภท" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ทุกประเภท</SelectItem>
            <SelectItem value="TRANSFER">ย้ายเด็ก</SelectItem>
            <SelectItem value="LOCATION_APPROVE">อนุมัติสถานที่</SelectItem>
            <SelectItem value="LOCATION_REJECT">ปฏิเสธสถานที่</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left font-medium px-4 py-3 w-[52%]">
                  <SortBtn label="หัวข้อ" col="title" onSort={handleSort} />
                </th>
                <th className="text-left font-medium px-4 py-3 w-[28%]">
                  <SortBtn label="โดย" col="actor" onSort={handleSort} />
                </th>
                <th className="text-left font-medium px-4 py-3 w-[16%]">
                  <SortBtn label="วันที่" col="createdAt" onSort={handleSort} />
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rawData.data.length ? (
                rawData.data.map((entry, index) => {
                  const numericId = Number(entry.id);
                  const hasValidId = Number.isFinite(numericId);
                  const rowKey = hasValidId
                    ? `history-${numericId}`
                    : `history-fallback-${entry.createdAt}-${entry.title}-${index}`;

                  return (
                  <tr
                    key={rowKey}
                    className="border-b last:border-0 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => {
                      if (!hasValidId) return;
                      router.push(`${pathname}/${numericId}`);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={entry.status} />
                        <span className="line-clamp-1">{entry.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ActorLabel actor={entry.actor} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatBE(entry.createdAt, "d MMM yyyy")}
                    </td>
                    <td
                      className="px-2 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    ไม่พบประวัติการดำเนินการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          พบ {rawData.meta.total} รายการ
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateURLParams({ page: (currentPage - 1).toString() })
            }
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            หน้าที่ {currentPage} จาก {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateURLParams({ page: (currentPage + 1).toString() })
            }
            disabled={currentPage >= totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
