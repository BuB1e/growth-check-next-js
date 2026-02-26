import { ChildAction, PaginatedChildResponse } from "@/actions/ChildAction";
import { MobileChildListItem } from "./childListItem";
import { FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface MobileChildListProps {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  minAge?: string;
  maxAge?: string;
  heightDev?: string;
  weightDev?: string;
  locationId?: string;
}

export async function MobileChildList({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  minAge = "",
  maxAge = "",
  heightDev = "",
  weightDev = "",
  locationId = "",
}: MobileChildListProps) {
  let paginatedData: PaginatedChildResponse | null = null;
  try {
    paginatedData = await ChildAction.getChildrenMock(
      page,
      limit,
      search,
      status,
      minAge,
      maxAge,
      heightDev,
      weightDev,
      locationId,
    );
  } catch (error) {
    console.error("Failed to load children", error);
  }

  const children = paginatedData?.data || [];
  const meta = paginatedData?.meta;

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

  const hasNextPage = meta && meta.page < meta.totalPages;
  const hasPrevPage = meta && meta.page > 1;

  return (
    <div className="space-y-4 pb-24">
      <div className="space-y-3">
        {children.map((child) => (
          <MobileChildListItem key={child.id} child={child} />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 pb-2 border-t border-gray-100">
          <Link
            href={`?page=${meta.page - 1}${search ? `&q=${search}` : ""}${status ? `&status=${status}` : ""}${minAge ? `&minAge=${minAge}` : ""}${maxAge ? `&maxAge=${maxAge}` : ""}${heightDev ? `&heightDev=${heightDev}` : ""}${weightDev ? `&weightDev=${weightDev}` : ""}${locationId ? `&locationId=${locationId}` : ""}`}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm active:scale-95 transition-all ${!hasPrevPage && "opacity-50 pointer-events-none"}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium text-gray-600">
            หน้า {meta.page} จาก {meta.totalPages}
          </span>
          <Link
            href={`?page=${meta.page + 1}${search ? `&q=${search}` : ""}${status ? `&status=${status}` : ""}${minAge ? `&minAge=${minAge}` : ""}${maxAge ? `&maxAge=${maxAge}` : ""}${heightDev ? `&heightDev=${heightDev}` : ""}${weightDev ? `&weightDev=${weightDev}` : ""}${locationId ? `&locationId=${locationId}` : ""}`}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm active:scale-95 transition-all ${!hasNextPage && "opacity-50 pointer-events-none"}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
