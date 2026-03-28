"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { UserResponse, PaginatedMetaDTO } from "@/dto";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StaffTableProps {
  data: UserResponse[];
  meta: PaginatedMetaDTO;
}

export function StaffTable({ data, meta }: StaffTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleRowClick = (user: UserResponse) => {
    router.push(`/desktop/staff/${user.id}`);
  };

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([name, value]) => {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      return params.toString();
    },
    [searchParams],
  );

  const handlePageChange = (newPage: number) => {
    router.push(`${pathname}?${createQueryString({ page: newPage.toString() })}`);
  };

  const currentPage = meta.page;
  const totalPages = meta.totalPages;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data} onRowClick={handleRowClick} />
      
      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-sm text-muted-foreground">
            พบทั้งหมด {meta.total} รายการ
          </p>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">หน้าก่อนหน้า</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center text-sm font-medium">
                หน้าที่ {currentPage} จาก {totalPages}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <span className="sr-only">หน้าถัดไป</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
