"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ChildIndex, PaginatedResponse } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MeasurementDrawer } from "@/components/features/staff/MeasurementDrawer";
import { Search, Plus, ChevronLeft, ChevronRight, Baby } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildListProps {
  readOnly?: boolean;
}

export function ChildList({ readOnly = false }: ChildListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<PaginatedResponse<ChildIndex>>({
    queryKey: ["children", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      const res = await apiClient.get(`/children?${params}`);
      return res.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleAddMeasurement = (childId: number) => {
    setSelectedChildId(childId);
    setDrawerOpen(true);
  };

  const statusColor: Record<string, string> = {
    In_Area: "bg-green-100 text-green-700",
    Out_Area: "bg-amber-100 text-amber-700",
    Unknown: "bg-gray-100 text-gray-600",
    Died: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<string, string> = {
    In_Area: "อยู่ในพื้นที่",
    Out_Area: "ย้ายออก",
    Unknown: "ไม่ทราบ",
    Died: "เสียชีวิต",
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อเด็ก..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่
        </div>
      )}

      {/* Child cards */}
      {data && (
        <>
          <div className="space-y-3">
            {data.data.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <Baby className="mx-auto mb-2 h-10 w-10" />
                <p>ไม่พบข้อมูลเด็ก</p>
              </div>
            )}

            {data.data.map((child) => (
              <Card
                key={child.id}
                className="transition-all hover:shadow-md active:scale-[0.98]"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Baby className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {child.fullName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{child.ageMonths} เดือน</span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            statusColor[child.status] || "bg-gray-100",
                          )}
                        >
                          {statusLabel[child.status] || child.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!readOnly && (
                    <Button
                      size="sm"
                      className="min-h-[44px] min-w-[44px]"
                      onClick={() => handleAddMeasurement(child.id)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">บันทึก</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.meta.total > data.meta.limit && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="min-h-[44px]"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                ก่อนหน้า
              </Button>
              <span className="text-sm text-gray-500">
                หน้า {page} / {Math.ceil(data.meta.total / data.meta.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.meta.total / data.meta.limit)}
                onClick={() => setPage((p) => p + 1)}
                className="min-h-[44px]"
              >
                ถัดไป
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Measurement Drawer */}
      {!readOnly && (
        <MeasurementDrawer
          childId={selectedChildId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      )}
    </div>
  );
}
