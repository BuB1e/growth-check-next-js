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
  DashboardStatusItem,
  DashboardTrendItem,
} from "@/components/features/desktop/dashboard-charts";
import { ChildAction } from "@/actions/ChildAction";
import { UserAction } from "@/actions/UserAction";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import { LocationAction } from "@/actions/LocationAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
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

  const normalizeGrowthStatus = (
    status: string | undefined,
  ): "normal" | "above" | "below" => {
    if (!status) return "normal";
    const s = status.toLowerCase().trim();

    if (
      s.includes("ตามเกณฑ์") ||
      s.includes("ปกติ") ||
      s.includes("normal") ||
      s.includes("สมส่วน")
    ) {
      return "normal";
    }

    if (
      s.includes("มาก") ||
      s.includes("สูง") ||
      s.includes("over") ||
      s.includes("above") ||
      s.includes("เกิน")
    ) {
      return "above";
    }

    return "below";
  };

  const monthLabel = (date: Date): string =>
    date.toLocaleDateString("th-TH", { month: "short" });

  const getRecentMonths = (): { key: string; label: string }[] => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      return { key, label: monthLabel(d) };
    });
  };

  // Fetch real metrics from API — gracefully handle failures
  const [childrenRes, usersRes, locationsRes, requestsRes, waitingRequestsRes, childDataRes] =
    await Promise.allSettled([
      ChildAction.getChildren(),
      UserAction.getUsers({ page: 1, limit: 5000, deleteStatus: false }),
      LocationAction.getLocations({ page: 1, limit: 5000, deleted: false }),
      LocationCreateRequestAction.getRequests(),
      LocationCreateRequestAction.getRequests({ requestStatus: "WAITING" }),
      ChildDataAction.getChildDataList({ page: 1, limit: 5000, deleteStatus: false }),
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

  const rawChildData =
    childDataRes.status === "fulfilled" ? childDataRes.value : [];

  const months = getRecentMonths();
  const monthIndex = new Map(
    months.map((m) => [m.key, { month: m.label, normal: 0, above: 0, below: 0 }]),
  );

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

  rawChildData.forEach((record) => {
    const date = new Date(record.heightDate);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const idx = months.findIndex((m) => m.key === key);
    if (idx === -1) return;

    const weightStatus = normalizeGrowthStatus(record.weightDevelopment?.status);
    const heightStatus = normalizeGrowthStatus(record.heightDevelopment?.status);

    trendDataWeight[idx][weightStatus] += 1;
    trendDataHeight[idx][heightStatus] += 1;
  });

  const latestPerChild = new Map<number, (typeof rawChildData)[number]>();
  rawChildData.forEach((record) => {
    const current = latestPerChild.get(record.childId);
    if (!current) {
      latestPerChild.set(record.childId, record);
      return;
    }
    if (
      new Date(record.heightDate).getTime() >
      new Date(current.heightDate).getTime()
    ) {
      latestPerChild.set(record.childId, record);
    }
  });

  const statusCounter = { above: 0, normal: 0, below: 0 };
  latestPerChild.forEach((record) => {
    const normalized = normalizeGrowthStatus(record.weightDevelopment?.status);
    statusCounter[normalized] += 1;
  });

  const statusData: DashboardStatusItem[] = [
    {
      status: "above",
      label: "สูงกว่าเกณฑ์",
      count: statusCounter.above,
      fill: "var(--color-above)",
      color: "#eab308",
      desc: "น้ำหนัก/ส่วนสูงสูงกว่าค่ามาตรฐาน",
    },
    {
      status: "normal",
      label: "สมส่วน",
      count: statusCounter.normal,
      fill: "var(--color-normal)",
      color: "#22c55e",
      desc: "น้ำหนัก/ส่วนสูงอยู่ในเกณฑ์ปกติ",
    },
    {
      status: "below",
      label: "ต่ำกว่าเกณฑ์",
      count: statusCounter.below,
      fill: "var(--color-below)",
      color: "#ef4444",
      desc: "น้ำหนัก/ส่วนสูงต่ำกว่าค่ามาตรฐาน — ต้องติดตาม",
    },
  ];

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
              อัปเดตตามข้อมูลจริงจากระบบ
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
              คำร้องที่ยังไม่ได้ดำเนินการ
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
            <ChildHealthTrendChart
              trendDataWeight={trendDataWeight}
              trendDataHeight={trendDataHeight}
            />
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
            <ChildHealthStatusChart statusData={statusData} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
