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
import { Baby, Users, MapPin, Activity } from "lucide-react";
import { Suspense } from "react";

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
  // Mock KPI Metrics
  const mockMetrics = {
    totalChildren: 600,
    totalArea: 10,
    totalStaff: 45,
    activeRequests: 12,
  };

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-7xl mx-auto">
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
              {mockMetrics.totalChildren}{" "}
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
              {mockMetrics.totalStaff}{" "}
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
              {mockMetrics.totalArea}{" "}
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
              {mockMetrics.activeRequests}{" "}
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
      <div className="grid gap-4 lg:grid-cols-7 mt-2">
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
    </div>
  );
}
