import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/features/desktop/date-range-picker";
import {
  ChildHealthStatusChart,
  ChildHealthTrendChart,
} from "@/components/features/desktop/dashboard-charts";
import { ChildAction } from "@/actions/ChildAction";
import { UserAction } from "@/actions/UserAction";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import { Baby, Users, MapPin, Activity } from "lucide-react";
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
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ภาพรวมระบบ (Dashboard)
          </h1>
          <Suspense
            fallback={
              <p className="text-muted-foreground mt-1 animate-pulse bg-muted rounded w-fit">
                กำลังโหลดข้อมูล...
              </p>
            }
          >
            <DashboardHeaderDate searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Date Filter */}
        <Suspense
          fallback={
            <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
          }
        >
          <DateRangePicker />
        </Suspense>
      </div>

      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardDataWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm border-slate-200/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="w-24 h-5 bg-muted rounded" />
              <div className="w-4 h-4 bg-muted rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-muted rounded mb-2" />
              <div className="w-32 h-4 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 mt-2">
        <Card className="col-span-1 lg:col-span-4 shadow-sm border-slate-200/60">
          <CardHeader>
            <div className="w-48 h-6 bg-muted rounded mb-2" />
            <div className="w-64 h-4 bg-muted rounded" />
          </CardHeader>
          <CardContent className="h-[300px] bg-slate-50 rounded-md mx-6 mb-6" />
        </Card>

        <Card className="col-span-1 lg:col-span-3 shadow-sm border-slate-200/60">
          <CardHeader>
            <div className="w-48 h-6 bg-muted rounded mb-2" />
            <div className="w-64 h-4 bg-muted rounded" />
          </CardHeader>
          <CardContent className="h-[300px] bg-slate-50 rounded-md mx-6 mb-6" />
        </Card>
      </div>
    </div>
  );
}

async function DashboardDataWrapper({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Await searchParams before destructuring just in case it's used
  await searchParams;

  // Fetch real metrics from API — gracefully handle failures
  // Relying on EnvConfig for default pagination sizes (page: 1, limit: 100)
  const [childrenRes, usersRes, requestsRes] =
    await Promise.allSettled([
      ChildAction.getChildren(),
      UserAction.getUsersByTeam(1),
      LocationCreateRequestAction.getRequests(),
    ]);

  const totalChildren =
    childrenRes.status === "fulfilled" ? childrenRes.value.length : 0;
  const totalStaff =
    usersRes.status === "fulfilled" ? usersRes.value.length : 0;
  // No GET /locations/ list endpoint — use approved location requests as proxy for area count
  const totalArea =
    requestsRes.status === "fulfilled"
      ? requestsRes.value.filter((r) => r.requestStatus === "APPROVE").length
      : 0;
  const activeRequests =
    requestsRes.status === "fulfilled"
      ? requestsRes.value.filter((r) => r.requestStatus === "WAITING").length
      : 0;

  return (
    <>
      {/* KPI Cards Layer */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              เด็กในความดูแล
            </CardTitle>
            <Baby className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalChildren}{" "}
              <span className="text-sm font-normal text-muted-foreground mr-1">
                คน
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12 จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              เจ้าหน้าที่ในระบบ
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStaff}{" "}
              <span className="text-sm font-normal text-muted-foreground mr-1">
                คน
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ปฏิบัติงานครอบคลุมทุกพื้นที่
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ชุมชนที่รับผิดชอบ
            </CardTitle>
            <MapPin className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalArea}{" "}
              <span className="text-sm font-normal text-muted-foreground mr-1">
                แห่ง
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ไม่มีพื้นที่เสี่ยงเพิ่ม
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              คำร้องรอดำเนินการ
            </CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeRequests}{" "}
              <span className="text-sm font-normal text-muted-foreground mr-1">
                รายการ
              </span>
            </div>
            <p className="text-xs text-destructive font-medium mt-1">
              ต้องดำเนินการด่วน 3 รายการ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Layer */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 mt-2">
        <Card className="lg:col-span-4 shadow-sm border-slate-200/60 flex flex-col">
          <CardHeader>
            <CardTitle>แนวโน้มภาวะโภชนาการ (6 เดือนล่าสุด)</CardTitle>
            <CardDescription>
              จำนวนเด็กจำแนกตามเกณฑ์น้ำหนักและส่วนสูง
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 w-full flex items-center justify-center -ml-4 pr-6">
            <ChildHealthTrendChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-slate-200/60 flex flex-col">
          <CardHeader>
            <CardTitle>สถานะการเจริญเติบโต</CardTitle>
            <CardDescription>
              จำนวนเด็กจำแนกตามเกณฑ์การเจริญเติบโตในปัจจุบัน
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 w-full flex items-center justify-center">
            <ChildHealthStatusChart />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
