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
import type { PaginatedMetaDTO } from "@/dto";
import { Request_status } from "@/types/Enums";
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
  MapPin,
  ArrowRightLeft,
} from "lucide-react";
import { formatBE } from "@/lib/date-utils";

// Combined request type matching the page
type CombinedRequest = {
  id: number;
  type: "location" | "transfer";
  userId: string;
  requestStatus?: Request_status;
  handledBy?: string;
  createdAt: Date;
  updatedAt: Date;
  // Location fields
  locationName?: string;
  locationMap?: string;
  province?: string;
  district?: string;
  sub_district?: string;
  zip_code?: string;
  // Transfer fields
  childId?: number;
  fromLocation?: number;
  toLocation?: number;
};

interface UnifiedRequestsData {
  data: CombinedRequest[];
  meta: PaginatedMetaDTO;
}

interface RequestsTableProps {
  rawData: UnifiedRequestsData;
  requestType?: string; // "all" | "location" | "transfer"
}

function StatusBadge({ status }: { status?: string }) {
  // For location requests, status is in requestStatus
  // For transfer requests, no handledBy = WAITING, has handledBy = APPROVE/REJECT
  if (!status) {
    return (
      <div className="flex items-center gap-1.5 text-yellow-500 font-medium">
        <Clock className="h-4 w-4" />
        รอดำเนินการ
      </div>
    );
  }

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

function TypeBadge({ type }: { type: "location" | "transfer" }) {
  if (type === "location") {
    return (
      <div className="flex items-center gap-1.5 text-blue-600 font-medium">
        <MapPin className="h-4 w-4" />
        สร้างสถานที่
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-purple-600 font-medium">
      <ArrowRightLeft className="h-4 w-4" />
      ย้ายเด็ก
    </div>
  );
}

// Get status for display (handles both location and transfer)
function getRequestStatus(item: CombinedRequest): string | undefined {
  if (item.requestStatus) return item.requestStatus;

  if (item.type === "location") {
    return item.requestStatus;
  } else {
    // Transfer: WAITING if no handledBy, APPROVE/REJECT if has handledBy
    if (!item.handledBy) return Request_status.WAITING;
    // Fallback if requestStatus is missing from some records
    return Request_status.APPROVE;
  }
}

export function RequestsTable({ rawData, requestType = "all" }: RequestsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const currentStatusProp = searchParams.get("status") || "all";
  const currentTypeProp = requestType || "all";

  // Sync state with props when URL changes
  const [statusFilter, setStatusFilter] = useState(currentStatusProp);
  const [typeFilter, setTypeFilter] = useState(currentTypeProp);
  const [prevProps, setPrevProps] = useState({ currentStatusProp, currentTypeProp });

  if (prevProps.currentStatusProp !== currentStatusProp || prevProps.currentTypeProp !== currentTypeProp) {
    setStatusFilter(currentStatusProp);
    setTypeFilter(currentTypeProp);
    setPrevProps({ currentStatusProp, currentTypeProp });
  }

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

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    updateURLParams({ type: val === "all" ? null : val, page: "1" });
  };

  const columns: ColumnDef<CombinedRequest>[] = [
    {
      id: "type",
      header: "ประเภท",
      cell: ({ row }) => <TypeBadge type={row.original.type} />,
    },
    {
      accessorKey: "title",
      header: "รายละเอียด",
      cell: ({ row }) => {
        const item = row.original;
        if (item.type === "location") {
          return (
            <div>
              <div className="font-medium">
                {typeof item.locationName === 'object' ? JSON.stringify(item.locationName) : (item.locationName || "—")}
              </div>
              <div className="text-sm text-muted-foreground">
                ต.{typeof item.sub_district === 'object' ? JSON.stringify(item.sub_district) : item.sub_district}
                อ.{typeof item.district === 'object' ? JSON.stringify(item.district) : item.district}
                จ.{typeof item.province === 'object' ? JSON.stringify(item.province) : item.province}
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div className="font-medium">
                ขอย้ายเด็ก (ID: {typeof item.childId === 'object' ? JSON.stringify(item.childId) : item.childId})
              </div>
              <div className="text-sm text-muted-foreground">
                จากเขต {typeof item.fromLocation === 'object' ? JSON.stringify(item.fromLocation) : item.fromLocation}
                → เขต {typeof item.toLocation === 'object' ? JSON.stringify(item.toLocation) : item.toLocation}
              </div>
            </div>
          );
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "วันที่ร้องขอ",
      cell: ({ row }) => formatBE(row.original.createdAt, "d MMM yyyy"),
      sortingFn: "datetime",
    },
    {
      id: "status",
      header: "สถานะ",
      cell: ({ row }) => <StatusBadge status={getRequestStatus(row.original)} />,
    },
  ];

  // Use rawData directly as it's already filtered on the server
  const filteredData = rawData.data;

  console.log("[RequestsTable] Render state:", {
    total: filteredData.length,
    typeFilter,
    statusFilter,
    propType: currentTypeProp,
    propStatus: currentStatusProp
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
              placeholder="ค้นหาชื่อสถานที่, ตำบล, อำเภอ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-72"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            ค้นหา
          </Button>
        </form>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ทุกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกประเภท</SelectItem>
              <SelectItem value="location">สร้างสถานที่</SelectItem>
              <SelectItem value="transfer">ย้ายเด็ก</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="ทุกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value={Request_status.WAITING}>รอดำเนินการ</SelectItem>
              <SelectItem value={Request_status.APPROVE}>อนุมัติแล้ว</SelectItem>
              <SelectItem value={Request_status.REJECT}>ปฏิเสธ</SelectItem>
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
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      const item = row.original;
                      const detailPath = item.type === "location"
                        ? `/desktop/requests/location/${item.id}`
                        : `/desktop/requests/transfer/${item.id}`;
                      router.push(detailPath);
                    }}
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
            disabled={currentPage >= totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">หน้าถัดไป</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
