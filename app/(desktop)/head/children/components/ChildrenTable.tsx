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
import { useRouter, useSearchParams } from "next/navigation";
import { ChildResponse } from "@/dto";
import { PaginatedChildResponse } from "@/actions/ChildAction";
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
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface ChildrenTableProps {
  rawData: PaginatedChildResponse;
}

export function ChildrenTable({ rawData }: ChildrenTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
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
    router.push(`/head/children?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams({ search: searchQuery || null, page: "1" });
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
      accessorKey: "first_name",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("first_name")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          ชื่อจริง
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "last_name",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("last_name")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          นามสกุล
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "birth_date",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("birth_date")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          วันเกิด
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.birth_date);
        return format(date, "d MMM yyyy", { locale: th });
      },
    },
    {
      accessorKey: "location_id",
      header: "สถานที่",
      cell: ({ row }) => {
        // Mock Location Resolver
        const id = row.original.location_id;
        if (id === 1) return "ชุมชน A";
        if (id === 2) return "ชุมชน B";
        return "ชุมชนอื่น";
      },
    },
    {
      accessorKey: "status",
      header: "พัฒนาการ",
      cell: ({ row }) => {
        const status = row.original.status;
        switch (status) {
          case "In_Area":
            return (
              <div className="flex items-center text-green-600 font-medium">
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> สมส่วน
              </div>
            );
          case "Out_Area":
            return (
              <div className="flex items-center text-yellow-500 font-medium">
                <AlertCircle className="mr-1.5 h-4 w-4" /> สูงกว่าเกณฑ์
              </div>
            );
          case "Unknown":
          default:
            return (
              <div className="flex items-center text-red-500 font-medium">
                <XCircle className="mr-1.5 h-4 w-4" /> ต่ำกว่าเกณฑ์
              </div>
            );
        }
      },
    },
    {
      accessorKey: "updated_at",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort("updated_at")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          วันที่แก้ไขล่าสุด
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.updated_at);
        return format(date, "d MMM yyyy", { locale: th });
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
              <SelectItem value="In_Area">สมส่วน</SelectItem>
              <SelectItem value="Out_Area">สูงกว่าเกณฑ์</SelectItem>
              <SelectItem value="Unknown">ต่ำกว่าเกณฑ์</SelectItem>
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
                    onClick={() =>
                      router.push(`/head/children/${row.original.id}`)
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
          แสดงข้อมูลทั้งหมด {rawData.meta.total} คน
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
