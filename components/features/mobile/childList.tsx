import { ChildAction } from "@/actions/ChildAction";
import { EnvConfig } from "@/configs/BackendConfig";
import type { ChildResponse, PaginatedResponseDTO } from "@/dto";
import { MobileChildListItem } from "./childListItem";
import { FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface MobileChildListProps {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  minAgeYears?: string;
  maxAgeYears?: string;
  minAge?: string;
  maxAge?: string;
  haStatus?: string;
  waStatus?: string;
  locationId?: string;
  sex?: string;
}

export async function MobileChildList({
  page = 1,
  limit = EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_MOBILE_SIZE,
  search = "",
  status = "",
  minAgeYears = "",
  maxAgeYears = "",
  minAge = "",
  maxAge = "",
  haStatus = "",
  waStatus = "",
  locationId = "",
  sex = "",
}: MobileChildListProps) {
  let listData: PaginatedResponseDTO<ChildResponse> = {
    data: [],
    meta: { total: 0, page, limit, totalPages: 0 },
  };
  try {
    listData = await ChildAction.getChildren({
      page,
      limit,
      q: search || undefined,
      locationId: locationId ? Number(locationId) : undefined,
      minAgeYears: minAgeYears || undefined,
      maxAgeYears: maxAgeYears || undefined,
      minAge: minAge || undefined,
      maxAge: maxAge || undefined,
      status: status || undefined,
      haStatus: haStatus || undefined,
      waStatus: waStatus || undefined,
      sex: sex || undefined,
    });
  } catch (error) {
    console.error("Failed to load children", error);
  }

  const children = listData.data;
  const total = listData.meta.total;
  const totalPages = listData.meta.totalPages;
  const currentPage = listData.meta.page;

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 shadow-inner mb-4">
          <FileQuestion className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900">
          ไม่พบรายชื่อเด็ก
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 max-w-[200px]">
          ยังไม่มีข้อมูลหรือไม่มีผลลัพธ์การค้นหา
        </p>
      </div>
    );
  }

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="space-y-4 pb-24">
      <div className="space-y-3">
        {children.map((child: ChildResponse) => (
          <MobileChildListItem key={child.id} child={child} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 pb-2 border-t border-gray-100">
          <Link
            href={`?page=${currentPage - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}${minAgeYears ? `&minAgeYears=${minAgeYears}` : ""}${maxAgeYears ? `&maxAgeYears=${maxAgeYears}` : ""}${minAge ? `&minAge=${minAge}` : ""}${maxAge ? `&maxAge=${maxAge}` : ""}${haStatus ? `&haStatus=${haStatus}` : ""}${waStatus ? `&waStatus=${waStatus}` : ""}${locationId ? `&locationId=${locationId}` : ""}${sex ? `&sex=${sex}` : ""}`}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm active:scale-95 transition-all ${!hasPrevPage && "opacity-50 pointer-events-none"}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium text-gray-600">
            หน้า {currentPage} จาก {totalPages}
          </span>
          <Link
            href={`?page=${currentPage + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}${minAgeYears ? `&minAgeYears=${minAgeYears}` : ""}${maxAgeYears ? `&maxAgeYears=${maxAgeYears}` : ""}${minAge ? `&minAge=${minAge}` : ""}${maxAge ? `&maxAge=${maxAge}` : ""}${haStatus ? `&haStatus=${haStatus}` : ""}${waStatus ? `&waStatus=${waStatus}` : ""}${locationId ? `&locationId=${locationId}` : ""}${sex ? `&sex=${sex}` : ""}`}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm active:scale-95 transition-all ${!hasNextPage && "opacity-50 pointer-events-none"}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
