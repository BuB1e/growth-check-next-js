"use client";

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
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"; // Assuming lucide-react as the source for these icons
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


  const columns: ColumnDef<ChildResponse>[] = [
    {
      accessorKey: "firstName",
      header: "ชื่อจริง",
    },
    {
      accessorKey: "lastName",
      header: "นามสกุล",
    },
    {
      accessorKey: "sex",
      header: "เพศ",
      cell: ({ row }) => {
        const sex = row.original.sex as Sex;
        return SexToThai[sex] ?? sex;
      },
    },
    {
      accessorKey: "birthDate",
      header: "วันเกิด",
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
      header: "วันที่แก้ไขล่าสุด",
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
