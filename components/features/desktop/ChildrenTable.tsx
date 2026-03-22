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
import { Child_status, Child_statusToThai, Sex, SexToThai } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"; // Assuming lucide-react as the source for these icons
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { formatBE } from "@/lib/date-utils";
import { ChildListFilters } from "@/components/features/mobile/ChildListFilters";

interface ChildrenTableProps {
  rawData: PaginatedResponseDTO<ChildResponse>;
  locationMap?: Record<number, string>;
}

export function ChildrenTable({ rawData, locationMap = {} }: ChildrenTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      accessorKey: "sex",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("sex")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          เพศ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const sex = row.original.sex as Sex;
        return SexToThai[sex] ?? sex;
      },
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
        const id = row.original.locationId;
        return locationMap[id] || `เขต ${id}`;
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
      <ChildListFilters />

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
