import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { HistoryAction } from "@/actions/HistoryAction";
import type { HistoryEntry, PaginatedHistoryResponse } from "@/dto";
import { HistoryTable } from "@/components/features/desktop/HistoryTable";

export const metadata = {
  title: "ประวัติการดำเนินการ",
};

export default function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ประวัติ</h2>
        <p className="text-muted-foreground mt-1">
          บันทึกการดำเนินการทั้งหมดในระบบ — การย้ายเด็ก,
          การอนุมัติ/ปฏิเสธสถานที่
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการประวัติ</CardTitle>
          <CardDescription>คลิกที่รายการเพื่อดูรายละเอียด</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSkeleton />}>
            <HistoryDataWrapper searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดประวัติ...</p>
    </div>
  );
}

async function HistoryDataWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const { EnvConfig } = await import("@/configs/BackendConfig");
  const page = Number(sp?.page) || 1;
  const limit = Number(sp?.limit) || EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE;
  const search = sp?.search;
  const type = sp?.type;
  const orderBy = (sp?.orderBy as keyof HistoryEntry) || "createdAt";
  const orderDirection = (sp?.orderDirection as "asc" | "desc") || "desc";

  let data: PaginatedHistoryResponse | null = null;

  try {
    data = await HistoryAction.getHistory(
      page,
      limit,
      search,
      type,
      orderBy,
      orderDirection,
    );
  } catch (error) {
    console.error("Failed to load history:", error);
  }

  if (!data) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm font-medium">
        ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return <HistoryTable rawData={data} />;
}
