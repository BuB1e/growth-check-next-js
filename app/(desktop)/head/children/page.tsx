import { Suspense } from "react";
import { ChildAction } from "@/actions/ChildAction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChildrenTable } from "./components/ChildrenTable";
import { Loader2 } from "lucide-react";
import { ChildResponse } from "@/dto";

export const metadata = {
  title: "ข้อมูลเด็กทั้งหมด",
};

// The outer page component does NOT touch searchParams directly.
// It renders a Suspense boundary so Next.js can do partial prerendering
// without blocking on the dynamic data.
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

// This is always an async server component that reads from the dynamic
// searchParams promise — placed inside Suspense so it never blocks the route.
async function ChildrenDataWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;
  const limit = Number(sp?.limit) || 10;
  const search = sp?.search;
  const status = sp?.status;
  const orderBy = (sp?.orderBy as keyof ChildResponse) || "updated_at";
  const orderDirection = (sp?.orderDirection as "asc" | "desc") || "desc";

  let data = null;

  try {
    data = await ChildAction.getChildren(
      page,
      limit,
      search,
      status,
      undefined,
      undefined,
      orderBy,
      orderDirection,
    );
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
