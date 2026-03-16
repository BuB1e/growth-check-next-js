import { Suspense } from "react";
import { ChildAction } from "@/actions/ChildAction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChildrenTable } from "@/components/features/desktop/ChildrenTable";
import { Loader2 } from "lucide-react";
import { EnvConfig } from "@/configs/BackendConfig";

export const metadata = {
  title: "ข้อมูลเด็กทั้งหมด",
};

export default function ChildrenPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ข้อมูลเด็ก</h2>
          <p className="text-muted-foreground mt-1">
            จัดการและดูข้อมูลพัฒนาการเด็กทั้งหมดในความดูแล
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อเด็ก</CardTitle>
          <CardDescription>
            คลิกที่รายชื่อเด็กเพื่อดูรายละเอียด หรือแก้ไขข้อมูล
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableLoadingSkeleton />}>
            <ChildrenDataWrapper searchParams={searchParams} />
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
      <p>กำลังโหลดข้อมูลเด็ก...</p>
    </div>
  );
}

async function ChildrenDataWrapper({
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
      : EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE;
  const search = sp?.search;
  let data = null;

  try {
    data = await ChildAction.getChildren({
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      firstName: search,
    });
  } catch (error) {
    console.error("Failed to load children", error);
  }

  if (!data) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm font-medium">
        ไม่สามารถโหลดข้อมูลเด็กได้ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return <ChildrenTable rawData={data} />;
}
