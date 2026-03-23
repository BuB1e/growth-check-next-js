"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserCreateStatusResponse } from "@/dto";
import type { PaginatedResponseDTO, TeamResponse } from "@/dto";
import { Request_status, Role, RoleTH } from "@/types";
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
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { formatBE } from "@/lib/date-utils";
import { UserRequestDetailsModal } from "./UserRequestDetailsModal";

interface UserRequestsTableProps {
  rawData: PaginatedResponseDTO<UserCreateStatusResponse>;
  teams: TeamResponse[];
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case Request_status.APPROVE:
      return (
        <div className="flex items-center gap-1.5 text-green-600 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          อนุมัติแล้ว
        </div>
      );
    case Request_status.REJECT:
      return (
        <div className="flex items-center gap-1.5 text-red-500 font-medium">
          <XCircle className="h-4 w-4" />
          ปฏิเสธ
        </div>
      );
    case Request_status.WAITING:
    default:
      return (
        <div className="flex items-center gap-1.5 text-yellow-500 font-medium">
          <Clock className="h-4 w-4" />
          รอดำเนินการ
        </div>
      );
  }
}

export function UserRequestsTable({ rawData, teams }: UserRequestsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || Request_status.WAITING,
  );
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get("role") || "all",
  );

  const [selectedRequest, setSelectedRequest] =
    useState<UserCreateStatusResponse | null>(null);

  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams({ q: searchQuery || null, page: "1" });
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    updateURLParams({ status: val === "all" ? null : val, page: "1" });
  };

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    updateURLParams({ role: val === "all" ? null : val, page: "1" });
  };

  const columns: ColumnDef<UserCreateStatusResponse>[] = [
    {
      accessorKey: "userId",
      header: "ชื่อ-นามสกุลผู้ขอเปิดบัญชี",
      cell: ({ row }) => {
        // Fallback or mapped from backend if available inside user object.
        const req = row.original as UserCreateStatusResponse & {
          user?: { firstName: string; lastName?: string };
          firstName?: string;
          lastName?: string;
        };
        if (req.user && req.user.firstName) {
          return `${req.user.firstName} ${req.user.lastName || ""}`;
        }
        if (req.firstName) {
          return `${req.firstName} ${req.lastName || ""}`;
        }
        return (
          <span className="text-gray-500 italic">
            User ID: {row.original.userId.substring(0, 8)}...
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "วันที่ร้องขอ",
      cell: ({ row }) => formatBE(row.original.createdAt, "d MMM yyyy"),
    },
    {
      accessorKey: "requestStatus",
      header: "สถานะคำร้อง",
      cell: ({ row }) => <StatusBadge status={row.original.requestStatus} />,
    },
    {
      id: "actions",
      header: "จัดการ",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRequest(row.original)}
            className="text-primary hover:text-primary-focus hover:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-1" />
            ตรวจสอบ
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: rawData.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentPage = rawData.meta.page;
  const totalPages = rawData.meta.totalPages;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-between">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 flex-wrap"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64 md:w-80"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            ค้นหา
          </Button>
        </form>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="สถานะคำร้อง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value={Request_status.WAITING}>
                รอดำเนินการ
              </SelectItem>
              <SelectItem value={Request_status.APPROVE}>
                อนุมัติแล้ว
              </SelectItem>
              <SelectItem value={Request_status.REJECT}>ปฏิเสธ</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="ตำแหน่ง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
              <SelectItem value={Role.HEAD}>{RoleTH.HEAD} (Head)</SelectItem>
              <SelectItem value={Role.USER}>{RoleTH.USER} (Staff)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    ไม่พบข้อมูลคำร้องขอ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
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
              <span className="sr-only">หน้าก่อนหน้า</span>
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
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">หน้าถัดไป</span>
            </Button>
          </div>
        </div>
      )}

      {selectedRequest && (
        <UserRequestDetailsModal
          request={selectedRequest}
          teams={teams}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
