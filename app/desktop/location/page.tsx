import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EnvConfig } from "@/configs/BackendConfig";
import { LocationAction } from "@/actions/LocationAction";
import { LocationsTable } from "@/components/features/desktop/LocationsTable";
import type { LocationResponse, PaginatedResponseDTO } from "@/dto";

export const metadata = {
  title: "ข้อมูลชุมชน",
};

export default function LocationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ข้อมูลชุมชน</h2>
          <p className="text-muted-foreground mt-1">
            จัดการและดูข้อมูลชุมชนทั้งหมดสำหรับผู้ดูแลระบบ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการชุมชน</CardTitle>
          <CardDescription>
            ค้นหาและดูรายละเอียดชุมชนทั้งหมดในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableLoadingSkeleton />}>
            <LocationDataWrapper searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูลชุมชน...</p>
    </div>
  );
}

async function LocationDataWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const parsedPage = Number(sp?.page);
  const parsedLimit = Number(sp?.limit);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE;
  const q = typeof sp?.q === "string" ? sp.q : undefined;
  const normalizedQ = q?.trim().toLowerCase();
  const queryPage = page;
  const queryLimit = limit;
  const fetchPage = normalizedQ ? 1 : queryPage;
  const fetchLimit = normalizedQ ? 1000 : queryLimit;

  let data: PaginatedResponseDTO<LocationResponse> | null = null;

  try {
    try {
      data = await LocationAction.getLocations({
        page: fetchPage,
        limit: fetchLimit,
        q,
        deleted: false,
      });
    } catch (error) {
      if (!normalizedQ) {
        throw error;
      }

      data = await LocationAction.getLocations({
        page: fetchPage,
        limit: fetchLimit,
        deleted: false,
      });
    }

    if (data && normalizedQ) {
      const filtered = data.data.filter((location) => {
        const name = location.name.toLowerCase();
        const province = location.province.toLowerCase();
        const district = location.district.toLowerCase();
        const subDistrict = location.subDistrict.toLowerCase();
        const zipCode = location.zipCode.toLowerCase();

        return (
          name.includes(normalizedQ) ||
          province.includes(normalizedQ) ||
          district.includes(normalizedQ) ||
          subDistrict.includes(normalizedQ) ||
          zipCode.includes(normalizedQ)
        );
      });

      const start = (queryPage - 1) * queryLimit;
      const end = start + queryLimit;
      const pagedFiltered = filtered.slice(start, end);

      data = {
        data: pagedFiltered,
        meta: {
          ...data.meta,
          total: filtered.length,
          totalPages: filtered.length > 0 ? Math.ceil(filtered.length / queryLimit) : 0,
          page: queryPage,
          limit: queryLimit,
        },
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    console.error(`Failed to load locations: ${errorMessage}`);
  }

  if (!data) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm font-medium">
        ไม่สามารถโหลดข้อมูลชุมชนได้ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return <LocationsTable rawData={data} />;
}
