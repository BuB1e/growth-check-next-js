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
import { LocationCreateRequestResponse } from "@/dto";
import type { PaginatedResponseDTO } from "@/dto";
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
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"; // Assuming these icons are from lucide-react
import { formatBE } from "@/lib/date-utils";

interface RequestsTableProps {
  rawData: PaginatedResponseDTO<LocationCreateRequestResponse>;
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

export function RequestsTable({ rawData }: RequestsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );

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

  const handleSort = (columnKey: keyof LocationCreateRequestResponse) => {
    const currentOrder = searchParams.get("orderBy");
    const currentDir = searchParams.get("orderDirection");
    const newDir =
      currentOrder === columnKey && currentDir === "desc" ? "asc" : "desc";
    updateURLParams({ orderBy: columnKey, orderDirection: newDir });
  };

  const SortHeader = ({
    label,
    col,
  }: {
    label: string;
    col: keyof LocationCreateRequestResponse;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(col)}
      className="-ml-3 h-8 data-[state=open]:bg-accent"
    >
      {label}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  );

  const columns: ColumnDef<LocationCreateRequestResponse>[] = [
    {
      accessorKey: "locationName",
      header: () => (
        <SortHeader label="ชื่อสถานที่ (ที่ขอสร้าง)" col="locationName" />
      ),
    },
    {
      id: "fullAddress",
      header: "สถานที่",
      cell: ({ row }) => {
        const { sub_district, district, province, zip_code } = row.original;
        return (
          <span className="text-sm text-muted-foreground">
            ต.{sub_district} อ.{district} จ.{province} {zip_code}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <SortHeader label="วันที่ร้องขอ" col="createdAt" />,
      cell: ({ row }) => formatBE(row.original.createdAt, "d MMM yyyy"),
    },
    {
      accessorKey: "updatedAt",
      header: () => <SortHeader label="วันที่แก้ไขล่าสุด" col="updatedAt" />,
      cell: ({ row }) => formatBE(row.original.updatedAt, "d MMM yyyy"),
    },
    {
      accessorKey: "requestStatus",
      header: () => <SortHeader label="สถานะ" col="requestStatus" />,
      cell: ({ row }) => <StatusBadge status={row.original.requestStatus} />,
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
                    onClick={() =>
                      router.push(`${pathname}/${row.original.id}`)
                    }
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
