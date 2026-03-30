import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DashboardFilters } from "@/components/features/desktop/DashboardFilters";
import {
  ChildHealthTrendChart,
  DashboardTrendItem,
} from "@/components/features/desktop/dashboard-charts";
import { ChildAction } from "@/actions/ChildAction";
import { UserAction } from "@/actions/UserAction";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import { LocationAction } from "@/actions/LocationAction";
import { AdminDashboardAction } from "@/actions/AdminDashboardAction";
import { Baby, Users, MapPin, Activity } from "lucide-react";
import { Request_status } from "@/types/Enums";
import { Suspense } from "react";

export const metadata = {
  title: "ภาพรวมระบบ",
};

// Server component handling searchParams
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function DashboardHeaderDate({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const fromParam = typeof params.from === "string" ? params.from : undefined;
  const toParam = typeof params.to === "string" ? params.to : undefined;

  let dateText = "ข้อมูลทั้งหมด";
  if (fromParam && toParam) {
    const fromDate = new Date(fromParam).toLocaleDateString("th-TH");
    const toDate = new Date(toParam).toLocaleDateString("th-TH");
    dateText = `ข้อมูลตั้งแต่วันที่ ${fromDate} ถึง ${toDate}`;
  } else if (fromParam) {
    const fromDate = new Date(fromParam).toLocaleDateString("th-TH");
    dateText = `ข้อมูลตั้งแต่วันที่ ${fromDate}`;
  }

  return <p className="text-muted-foreground mt-1">{dateText}</p>;
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="flex-1 space-y-10 p-4 font-lexend md:p-8 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-display-lg text-on-surface font-bold tracking-tight">
            ภาพรวมระบบ
          </h1>
          <Suspense
            fallback={
              <p className="text-on-surface-variant text-body-lg animate-pulse bg-surface-container-low rounded-lg w-48 h-6" />
            }
          >
            <DashboardHeaderDate searchParams={searchParams} />
          </Suspense>
        </div>

        <div className="flex items-center gap-4">
           {/* Filters will be rendered here by the wrapper */}
        </div>
      </div>

      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardDataWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-surface-container-low rounded-lg" />
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="h-96 bg-surface-container-low rounded-lg" />
        <div className="h-96 bg-surface-container-low rounded-lg" />
      </div>
    </div>
  );
}

async function DashboardDataWrapper({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const monthLabel = (date: Date): string =>
    date.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });

  const getRecentMonths = (): { key: string; label: string }[] => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      return { key, label: monthLabel(d) };
    });
  };

  const [childrenRes, usersRes, locationsRes, , waitingRequestsRes, chartRes] =
    await Promise.allSettled([
      ChildAction.getChildren(),
      UserAction.getUsers({ page: 1, limit: 5000, deleteStatus: false }),
      LocationAction.getLocations({ page: 1, limit: 5000, deleted: false }),
      LocationCreateRequestAction.getRequests(),
      LocationCreateRequestAction.getRequests({ status: Request_status.WAITING }),
      AdminDashboardAction.getDashboardChartData({
        startDate: typeof params.from === "string" ? new Date(params.from) : undefined,
        endDate: typeof params.to === "string" ? new Date(params.to) : undefined,
        locationId: typeof params.locationId === "string" && params.locationId ? parseInt(params.locationId) : undefined,
        minAge: typeof params.minAge === "string" && params.minAge ? parseInt(params.minAge) : undefined,
        maxAge: typeof params.maxAge === "string" && params.maxAge ? parseInt(params.maxAge) : undefined,
        sex: typeof params.sex === "string" && params.sex ? (params.sex as import("@/types").Sex) : undefined,
      }),
    ]);

  const totalChildren =
    childrenRes.status === "fulfilled" ? childrenRes.value.meta.total : 0;
  const totalStaff =
    usersRes.status === "fulfilled" ? usersRes.value.length : 0;
  const totalArea =
    locationsRes.status === "fulfilled"
      ? locationsRes.value.meta.total
      : 0;
  const activeRequests =
    waitingRequestsRes.status === "fulfilled"
      ? waitingRequestsRes.value.meta.total
      : 0;

  const locations =
    locationsRes.status === "fulfilled" ? locationsRes.value.data : [];

  const months = getRecentMonths();

  const trendDataWeight: DashboardTrendItem[] = months.map((m) => ({
    month: m.label,
    normal: 0,
    above: 0,
    below: 0,
  }));
  const trendDataHeight: DashboardTrendItem[] = months.map((m) => ({
    month: m.label,
    normal: 0,
    above: 0,
    below: 0,
  }));

  const rawChartData = chartRes.status === "fulfilled" ? chartRes.value : [];

  rawChartData.forEach((record) => {
    const date = new Date(record.date);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const idx = months.findIndex((m) => m.key === key);
    if (idx === -1) return;

    trendDataWeight[idx].above = record.weightAbove;
    trendDataWeight[idx].normal = record.weightNormal;
    trendDataWeight[idx].below = record.weightBelow;

    trendDataHeight[idx].above = record.heightAbove;
    trendDataHeight[idx].normal = record.heightNormal;
    trendDataHeight[idx].below = record.heightBelow;
  });

  return (
    <>
      <div className="w-full flex justify-end -mt-20 mb-10">
        <DashboardFilters locations={locations} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest">
              เด็กในความดูแล
            </CardTitle>
            <div className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
              <Baby className="size-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-bold text-on-surface">
              {totalChildren}
              <span className="text-headline-md font-medium text-on-surface-variant ml-2">
                คน
              </span>
            </div>
            <p className="text-body-lg text-on-surface-variant mt-2">
              ข้อมูลปัจจุบันในระบบ
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest">
              เจ้าหน้าที่ทั้งหมด
            </CardTitle>
            <div className="size-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shadow-sm group-hover:bg-secondary group-hover:text-white transition-colors">
              <Users className="size-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-bold text-on-surface">
              {totalStaff}
              <span className="text-headline-md font-medium text-on-surface-variant ml-2">
                คน
              </span>
            </div>
            <p className="text-body-lg text-on-surface-variant mt-2">
              ปฏิบัติงานในพื้นที่
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest">
              พื้นที่รับผิดชอบ
            </CardTitle>
            <div className="size-10 rounded-xl bg-primary-fixed-dim/20 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary! group-hover:text-white transition-colors">
              <MapPin className="size-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-bold text-on-surface">
              {totalArea}
              <span className="text-headline-md font-medium text-on-surface-variant ml-2">
                แห่ง
              </span>
            </div>
            <p className="text-body-lg text-on-surface-variant mt-2">
              ครอบคลุมทุกตำบล
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest">
              คำร้องรอดำเนินการ
            </CardTitle>
            <div className="size-10 rounded-xl bg-tertiary-container flex items-center justify-center text-tertiary shadow-sm group-hover:bg-tertiary group-hover:text-white transition-colors animate-pulse">
              <Activity className="size-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-bold text-tertiary">
              {activeRequests}
              <span className="text-headline-md font-medium text-tertiary/70 ml-2">
                รายการ
              </span>
            </div>
            <p className="text-body-lg text-tertiary/60 mt-2 font-bold">
              ต้องการการตรวจสอบ
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mt-4">
        <Card className="p-4">
          <CardHeader className="px-4">
            <CardTitle className="text-headline-md font-bold text-on-surface">
              แนวโน้มภาวะโภชนาการ (น้ำหนัก)
            </CardTitle>
            <CardDescription className="text-body-lg">
              จำนวนเด็กตามเกณฑ์น้ำหนัก
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <ChildHealthTrendChart
              data={trendDataWeight}
              metric="weight"
            />
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="px-4">
            <CardTitle className="text-headline-md font-bold text-on-surface">
              แนวโน้มการเจริญเติบโต (ส่วนสูง)
            </CardTitle>
            <CardDescription className="text-body-lg">
              จำนวนเด็กตามเกณฑ์ส่วนสูง
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <ChildHealthTrendChart
              data={trendDataHeight}
              metric="height"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
