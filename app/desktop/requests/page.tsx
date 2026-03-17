import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import type { LocationCreateRequestResponse, PaginatedResponseDTO } from "@/dto";
import { RequestsTable } from "@/components/features/desktop/RequestsTable";

export const metadata = {
  title: "คำร้องขอสร้างสถานที่",
};

export default function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">คำร้องขอ</h2>
          <p className="text-muted-foreground mt-1">
            รายการคำร้องขอสร้างสถานที่ใหม่จากเจ้าหน้าที่
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการคำร้องขอ</CardTitle>
          <CardDescription>
            คลิกที่รายการเพื่อดูรายละเอียดคำร้องขอ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableLoadingSkeleton />}>
            <RequestsDataWrapper searchParams={searchParams} />
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
      <p>กำลังโหลดข้อมูลคำร้องขอ...</p>
    </div>
  );
}

async function RequestsDataWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const { EnvConfig } = await import("@/configs/BackendConfig");
  const parsedPage = Number(sp?.page);
  const parsedLimit = Number(sp?.limit);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE;
  const q = typeof sp?.q === "string" ? sp.q : undefined;
  const requestStatus =
    sp?.status === "WAITING" || sp?.status === "APPROVE" || sp?.status === "REJECT"
      ? sp.status
      : undefined;

  let data: PaginatedResponseDTO<LocationCreateRequestResponse> | null = null;

  try {
    data = await LocationCreateRequestAction.getRequests({
      page,
      limit,
      q,
      requestStatus,
    });
  } catch (error) {
    console.error("Failed to load requests:", error);
  }

  if (!data) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm font-medium">
        ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return <RequestsTable rawData={data} />;
}
