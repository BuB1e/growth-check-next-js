"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LocationResponse, PaginatedResponseDTO } from "@/dto";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatBE } from "@/lib/date-utils";

interface LocationsTableProps {
  rawData: PaginatedResponseDTO<LocationResponse>;
}

export function LocationsTable({ rawData }: LocationsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

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

  const { data, meta } = rawData;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-md">
        <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อชุมชน, จังหวัด, อำเภอ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            ค้นหา
          </Button>
        </form>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>ชื่อชุมชน</TableHead>
                <TableHead>จังหวัด</TableHead>
                <TableHead>อำเภอ</TableHead>
                <TableHead>ตำบล</TableHead>
                <TableHead>รหัสไปรษณีย์</TableHead>
                <TableHead>แก้ไขล่าสุด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? (
                data.map((location) => (
                  <TableRow
                    key={location.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`${pathname}/${location.id}`)}
                  >
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.province}</TableCell>
                    <TableCell>{location.district}</TableCell>
                    <TableCell>{location.subDistrict}</TableCell>
                    <TableCell>{location.zipCode}</TableCell>
                    <TableCell>{formatBE(location.updatedAt, "d MMM yy")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    ไม่พบข้อมูลชุมชน
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">พบ {meta.total} รายการ</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateURLParams({ page: String(meta.page - 1) })}
            disabled={meta.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">หน้าก่อนหน้า</span>
          </Button>
          <span className="text-sm font-medium">
            หน้า {meta.page} จาก {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateURLParams({ page: String(meta.page + 1) })}
            disabled={meta.page >= meta.totalPages || meta.totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">หน้าถัดไป</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
