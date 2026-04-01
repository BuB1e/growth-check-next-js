import { Suspense } from "react";
import { ChildAction } from "@/actions/ChildAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import { DevelopmentAction } from "@/actions/DevelopmentAction";
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
    <div className="flex-1 space-y-10 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-display-lg text-on-surface font-bold tracking-tight">
            ข้อมูลการเจริญเติบโตของเด็ก
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            บันทึกและติดตามพัฒนาการของเด็กในความดูแลอย่างใกล้ชิด เพื่อประเมินภาวะโภชนาการและการเจริญเติบโตที่สมวัย
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild size="lg" className="rounded-2xl px-8 shadow-lg shadow-primary/20">
            <Link href="/desktop/children/create" className="flex items-center gap-3">
              <Plus className="size-6" />
              <span className="text-body-lg font-bold">เพิ่มข้อมูลเด็ก</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-lg mt-4">
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-headline-md font-bold">บัญชีรายชื่อเด็ก</CardTitle>
          <CardDescription className="text-body-lg mt-1">
            ท่านสามารถค้นหา กรองข้อมูล หรือเลือกดูประวัติการเจริญเติบโตรายบุคคลได้จากตาราง
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
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
      : EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE;
  const q = sp?.q;
  const status = sp?.status;
  const minAge = sp?.minAge;
  const maxAge = sp?.maxAge;
  const haStatus = sp?.haStatus;
  const waStatus = sp?.waStatus;
  const locationId = sp?.locationId;
  const sex = sp?.sex;
  let data = null;
  let locationMap: Record<number, string> = {};
  let heightCriteriaMap: Record<number, string> = {};
  let weightCriteriaMap: Record<number, string> = {};

  try {
    const [childrenData, locationsData] = await Promise.all([
      ChildAction.getChildren({
        ...(page ? { page } : {}),
        ...(limit ? { limit } : {}),
        q,
        status,
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

    const childIds = (childrenData.data ?? []).map((child) => child.id);
    if (childIds.length > 0) {
      const latestChildDataPerChild = await Promise.all(
        childIds.map(async (childId) => {
          const latestList = await ChildDataAction.getLatestChildDataByChildId(childId);
          return {
            childId,
            latest: latestList[0],
          };
        }),
      );

      const developmentsRes = await DevelopmentAction.getDevelopments({
        page: 1,
        limit: 2000,
        deleteStatus: false,
      });
      const developmentStatusById = (developmentsRes.data ?? []).reduce(
        (acc, dev) => {
          acc[dev.id] = dev.status;
          return acc;
        },
        {} as Record<number, string>,
      );

      heightCriteriaMap = latestChildDataPerChild.reduce((acc, item) => {
        const devId = item.latest?.heightDevelopmentId;
        acc[item.childId] = devId ? developmentStatusById[devId] ?? "-" : "-";
        return acc;
      }, {} as Record<number, string>);

      weightCriteriaMap = latestChildDataPerChild.reduce((acc, item) => {
        const devId = item.latest?.weightDevelopmentId;
        acc[item.childId] = devId ? developmentStatusById[devId] ?? "-" : "-";
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

  return (
    <ChildrenTable
      rawData={data}
      locationMap={locationMap}
      heightCriteriaMap={heightCriteriaMap}
      weightCriteriaMap={weightCriteriaMap}
    />
  );
}
