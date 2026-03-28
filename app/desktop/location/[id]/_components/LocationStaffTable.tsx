"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserResponse, PaginatedResponseDTO } from "@/dto";
import { RoleToThai } from "@/types";
import { formatBE } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface LocationStaffTableProps {
  rawData: PaginatedResponseDTO<UserResponse>;
}

export function LocationStaffTable({ rawData }: LocationStaffTableProps) {
  const { data: staff, meta } = rawData;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("staffQ") || "");

  const applySearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("staffQ", q);
    } else {
      params.delete("staffQ");
    }
    params.set("tab", "staff");
    params.set("staffPage", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [q, searchParams, pathname, router]);

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("staffPage", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fallback client-side filtering if server doesn't filter perfectly
  const filteredStaff = useMemo(() => {
    const staffQ = searchParams.get("staffQ")?.toLowerCase();
    if (!staffQ) return staff;

    return staff.filter(user =>
      user.firstName.toLowerCase().includes(staffQ) ||
      user.lastName.toLowerCase().includes(staffQ) ||
      user.email.toLowerCase().includes(staffQ)
    );
  }, [staff, searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อเจ้าหน้าที่..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            className="pl-10 text-lg h-12 rounded-xl"
          />
        </div>
        <Button onClick={applySearch} className="h-12 px-8 rounded-xl text-base font-bold">
          ค้นหา
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold text-base">ชื่อ-นามสกุล</TableHead>
              <TableHead className="font-bold text-base">บทบาท</TableHead>
              <TableHead className="font-bold text-base">อีเมล</TableHead>
              <TableHead className="font-bold text-base text-right">วันที่เข้าร่วม</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((user) => (
                <TableRow key={user.id} className="text-base cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/desktop/staff/${user.id}`)}>
                  <TableCell className="font-semibold text-lg py-4">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="px-3 py-1">
                      {RoleToThai[user.role] ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right">
                    {formatBE(user.createdAt, "d MMM yyyy")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground text-lg">
                  ไม่พบข้อมูลเจ้าหน้าที่
                  {searchParams.get("staffQ") && (
                    <p className="text-sm mt-1">จากการค้นหา &quot;{searchParams.get("staffQ")}&quot;</p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            ทั้งหมด {meta.total} คน
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePage(meta.page - 1)}
              disabled={meta.page <= 1}
              className="h-10 w-10 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-base font-medium mx-2">
              หน้า {meta.page} จาก {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="h-10 w-10 p-0 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
