import { Suspense } from "react";
import { ChildAction } from "@/actions/ChildAction";
import { LocationAction } from "@/actions/LocationAction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChildrenTable } from "@/components/features/desktop/ChildrenTable";
import { Loader2, Plus } from "lucide-react";
import { EnvConfig } from "@/configs/BackendConfig";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/desktop/children/create">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มข้อมูลเด็ก
            </Link>
          </Button>
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
  const q = sp?.q;
  const status = sp?.status;
  const minAgeYears = sp?.minAgeYears;
  const maxAgeYears = sp?.maxAgeYears;
  const minAge = sp?.minAge;
  const maxAge = sp?.maxAge;
  const haStatus = sp?.haStatus;
  const waStatus = sp?.waStatus;
  const locationId = sp?.locationId;
  const sex = sp?.sex;
  let data = null;
  let locationMap: Record<number, string> = {};

  try {
    const [childrenData, locationsData] = await Promise.all([
      ChildAction.getChildren({
        ...(page ? { page } : {}),
        ...(limit ? { limit } : {}),
        q,
        status,
        minAgeYears,
        maxAgeYears,
        minAge,
        maxAge,
        haStatus,
        waStatus,
        locationId: locationId ? Number(locationId) : undefined,
        sex,
      }),
      LocationAction.getLocations({ page: 1, limit: 1000, deleted: false }),
    ]);
    
    data = childrenData;
    
    if (locationsData?.data) {
      locationMap = locationsData.data.reduce((acc, loc) => {
        acc[loc.id] = loc.name;
        return acc;
      }, {} as Record<number, string>);
    }
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

  return <ChildrenTable rawData={data} locationMap={locationMap} />;
}
