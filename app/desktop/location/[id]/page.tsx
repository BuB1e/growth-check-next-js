import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocationAction } from "@/actions/LocationAction";
import { LocationDetailForm } from "@/components/features/desktop/LocationDetailForm";
import { formatBE } from "@/lib/date-utils";
import { UserAction } from "@/actions/UserAction";
import { ChildAction } from "@/actions/ChildAction";
import { LocationStaffTable } from "./_components/LocationStaffTable";
import { LocationChildrenTable } from "./_components/LocationChildrenTable";
import { LocationDetailTabs } from "./_components/LocationDetailTabs";

export const metadata = {
  title: "รายละเอียดชุมชน",
};

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default function LocationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-4 flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/location">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">กลับไปหน้ารายการชุมชน</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">รายละเอียดชุมชน</h2>
          <p className="text-muted-foreground mt-1">
            แก้ไขข้อมูลชื่อชุมชน ที่อยู่ และข้อมูลแผนที่
          </p>
        </div>
      </div>

      <Suspense fallback={<DetailLoadingSkeleton />}>
        <LocationDetailContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function DetailLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูลชุมชน...</p>
    </div>
  );
}

async function LocationDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);

  if (!id || Number.isNaN(Number(id))) {
    notFound();
  }

  const location = await LocationAction.getLocationById(id);

  if (!location) {
    notFound();
  }

  // Fetch children and staff
  const parsedPage = Number(sp?.page);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const q = sp?.q;
  const staffQ = sp?.staffQ;
  const minAgeYears = sp?.minAgeYears;
  const maxAgeYears = sp?.maxAgeYears;
  const haStatus = sp?.haStatus;
  const waStatus = sp?.waStatus;
  const activeTab = sp?.tab || "info";

  const staffPage = Number(sp.staffPage) || 1;

  const [staffRes, childrenData] = await Promise.all([
    UserAction.getUsersByTeamPaginated(location.teamId, { 
      page: staffPage,
      limit: 10,
      q: staffQ 
    }),
    ChildAction.getChildren({
      locationId: Number(id),
      page,
      limit: 10,
      q,
      minAgeYears,
      maxAgeYears,
      haStatus,
      waStatus,
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <LocationDetailTabs
        activeTab={activeTab}
        infoContent={
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-6">
              <CardTitle className="text-2xl">แก้ไขข้อมูลชุมชน</CardTitle>
              <CardDescription className="text-base">
                {location.name} • สร้างเมื่อ {formatBE(location.createdAt, "d MMM yy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <LocationDetailForm location={location} />
            </CardContent>
          </Card>
        }
        staffContent={
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-6">
              <CardTitle className="text-2xl font-bold">รายชื่อเจ้าหน้าที่</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                เจ้าหน้าที่ทั้งหมดที่ปฏิบัติงานในเขต {location.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <LocationStaffTable rawData={staffRes} />
            </CardContent>
          </Card>
        }
        childrenContent={
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-6">
              <CardTitle className="text-2xl font-bold">ข้อมูลเด็กในความดูแล</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                รายการเด็กทั้งหมดในเขต {location.name} ท่านสามารถกรองข้อมูลได้ตามอายและเกณฑ์พัฒนาการ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <LocationChildrenTable rawData={childrenData} />
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
