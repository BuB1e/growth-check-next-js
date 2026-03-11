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
import type { LocationCreateRequestResponse, PaginatedResponse } from "@/dto";
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
  const page = Number(sp?.page) || 1;
  const limit = Number(sp?.limit) || 10;
  const search = sp?.search;
  const status = sp?.status;
  const orderBy =
    (sp?.orderBy as keyof LocationCreateRequestResponse) || "updatedAt";
  const orderDirection = (sp?.orderDirection as "asc" | "desc") || "desc";

  let data: PaginatedResponse<LocationCreateRequestResponse> | null = null;

  try {
    // TODO: Pass query params to API when backend supports list endpoint
    const result = await LocationCreateRequestAction.getRequestsByUserId(
      "all",
      { page, limit },
    );
    data = { data: result, meta: { total: result.length, page, limit, totalPages: Math.ceil(result.length / limit) } };
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
