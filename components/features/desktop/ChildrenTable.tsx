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
import { ChildResponse, PaginatedResponseDTO } from "@/dto";
import { Child_status, Child_statusToThai } from "@/types";
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
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"; // Assuming lucide-react as the source for these icons
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { formatBE } from "@/lib/date-utils";

interface ChildrenTableProps {
  rawData: PaginatedResponseDTO<ChildResponse>;
}

export function ChildrenTable({ rawData }: ChildrenTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || "",
  );
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

  const handleSort = (columnKey: keyof ChildResponse) => {
    const currentOrder = searchParams.get("orderBy");
    const currentDir = searchParams.get("orderDirection");

    let newDir = "desc";
    if (currentOrder === columnKey && currentDir === "desc") {
      newDir = "asc";
    }

    updateURLParams({ orderBy: columnKey, orderDirection: newDir });
  };

  const columns: ColumnDef<ChildResponse>[] = [
    {
      accessorKey: "firstName",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("firstName")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          ชื่อจริง
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "lastName",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("lastName")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          นามสกุล
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "birthDate",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("birthDate")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          วันเกิด
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return formatBE(row.original.birthDate, "d MMM yyyy");
      },
    },
    {
      accessorKey: "locationId",
      header: "สถานที่",
      cell: ({ row }) => {
        // TODO: Resolve location name via LocationAction.getLocationById when caching is in place
        const id = row.original.locationId;
        return `เขต ${id}`;
      },
    },
    {
      accessorKey: "status",
      header: "พัฒนาการ",
      cell: ({ row }) => {
        const status = row.original.status;
        const thaiStatus = Child_statusToThai[status] ?? status;
        switch (status) {
          case Child_status.IN_AREA:
            return (
              <div className="flex items-center text-green-600 font-medium">
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> {thaiStatus}
              </div>
            );
          case Child_status.OUT_AREA:
            return (
              <div className="flex items-center text-yellow-500 font-medium">
                <AlertCircle className="mr-1.5 h-4 w-4" /> {thaiStatus}
              </div>
            );
          case Child_status.UNKNOWN:
          case Child_status.DIED:
          default:
            return (
              <div className="flex items-center text-red-500 font-medium">
                <XCircle className="mr-1.5 h-4 w-4" /> {thaiStatus}
              </div>
            );
        }
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("updatedAt")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          วันที่แก้ไขล่าสุด
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return formatBE(row.original.updatedAt, "d MMM yyyy");
      },
    },
  ];

  const total = rawData.meta.total;
  const totalPages = rawData.meta.totalPages;
  const currentPage = rawData.meta.page;
  const paginatedData = rawData.data;

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Controls Container */}
      <div className="flex flex-wrap gap-3 justify-between">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center max-w-sm"
        >
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ค้นหาตามชื่อ/นามสกุล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="secondary" className="ml-2 shrink-0">
            ค้นหา
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ทุกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกเกณฑ์</SelectItem>
              <SelectItem value={Child_status.IN_AREA}>
                {Child_statusToThai[Child_status.IN_AREA]}
              </SelectItem>
              <SelectItem value={Child_status.OUT_AREA}>
                {Child_statusToThai[Child_status.OUT_AREA]}
              </SelectItem>
              <SelectItem value={Child_status.UNKNOWN}>
                {Child_statusToThai[Child_status.UNKNOWN]}
              </SelectItem>
              <SelectItem value={Child_status.DIED}>
                {Child_statusToThai[Child_status.DIED]}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`${pathname}/${row.original.id}`)}
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
                    ไม่พบข้อมูลเด็ก
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          แสดงข้อมูลทั้งหมด {total} คน
        </div>
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
