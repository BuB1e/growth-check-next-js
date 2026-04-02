import { Suspense } from "react";
import { ChildAction } from "@/actions/ChildAction";
import { AiPredictionAction } from "@/actions/AiPredictionAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import { LocationAction } from "@/actions/LocationAction";
import { DevelopmentAction } from "@/actions/DevelopmentAction";
import { notFound } from "next/navigation";
import axios from "axios";
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
import { ChildProfileForm } from "@/components/features/desktop/ChildProfileForm";
import { MeasurementHistory } from "@/components/features/desktop/MeasurementHistory";
import { GrowthChart } from "@/components/features/desktop/GrowthChart";
import { PredictionCard } from "@/components/features/desktop/PredictionCard";
import { MeasurementQuickAddCard } from "@/components/features/desktop/MeasurementQuickAddCard";
import { EnvConfig } from "@/configs/BackendConfig";
import { formatAgeThai, formatBE } from "@/lib/date-utils";
import { getCurrentSession } from "@/lib/auth/session.server";
import type { AiPredictionResponse, LocationResponse } from "@/dto";

export const metadata = {
  title: "รายละเอียดข้อมูลเด็ก",
};

function isExpectedBuildAuthError(error: unknown): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" &&
    axios.isAxiosError(error) &&
    error.response?.status === 401
  );
}

// Outer page — does NOT await params. Passes Promise to inner component
// inside Suspense to avoid the "Uncached data" static build error.
export default function ChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          {/* Back to the shared children list */}
          <Link href="/children">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">กลับไปหน้ารายชื่อเด็ก</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            รายละเอียดข้อมูลเด็ก
          </h2>
          <p className="text-muted-foreground mt-1">
            ดูประวัติ แผนภูมิการเจริญเติบโต และแก้ไขข้อมูลส่วนตัว
          </p>
        </div>
      </div>

      <Suspense fallback={<DetailLoadingSkeleton />}>
        <ChildDetailContent params={params} />
      </Suspense>
    </div>
  );
}

function DetailLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูลเด็ก...</p>
    </div>
  );
}

// This async component resolves the params Promise inside Suspense
async function ChildDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const childId = parseInt(id, 10);

  if (isNaN(childId)) {
    notFound();
  }

  const child = await ChildAction.getChildById(id);

  if (!child) {
    notFound();
  }

  const ageText = formatAgeThai(child.birthDate);
  const birthDateText = formatBE(child.birthDate, "d MMMM yyyy");

  // Fetch child-data for charts
  let childData: import("@/dto").ChildDataResponse[] = [];
  try {
    const res = await ChildDataAction.getChildDataList({
      childId,
      limit: EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE,
    });
    childData = res;
  } catch (error) {
    console.error("Failed to load child data for charts:", error);
  }

  // Fetch real locations for profile location selector.
  let locations: LocationResponse[] = [];
  try {
    const locationRes = await LocationAction.getLocations({
      page: 1,
      limit: 200,
      deleted: false,
    });
    locations = locationRes.data;
  } catch (error) {
    console.error("Failed to load locations for child profile:", error);
  }

  let latestPrediction: AiPredictionResponse | null = null;
  try {
    latestPrediction = await AiPredictionAction.getLatestPredictionByChildId(childId);
  } catch (error) {
    console.error("Failed to load child latest prediction:", error);
  }

  // Fetch developments for coloring the chart points
  let developments: import("@/dto").DevelopmentResponse[] = [];
  try {
    const devRes = await DevelopmentAction.getDevelopments({
      page: 1,
      limit: 2000,
      deleteStatus: false,
    });
    developments = devRes.data;
  } catch (error) {
    if (!isExpectedBuildAuthError(error)) {
      console.error("Failed to load developments for chart coloring:", error);
    }
  }

  const session = await getCurrentSession();
  const userId = session?.user.id;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          <CardDescription>
            {child.firstName} {child.lastName} • อายุ {ageText} • เกิดวันที่ {birthDateText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChildProfileForm child={child} locations={locations} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>บันทึกข้อมูลล่าสุด</CardTitle>
          <CardDescription>
            เพิ่มน้ำหนัก และ ส่วนสูง และวันที่วัดใหม่
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementQuickAddCard
            childId={childId}
            locationId={child.locationId}
            birthDate={new Date(child.birthDate)}
            userId={userId!}
          />
        </CardContent>
      </Card>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>แผนภูมิการเจริญเติบโต</CardTitle>
          <CardDescription>
            แสดงแนวโน้มน้ำหนักและส่วนสูงเทียบกับเกณฑ์มาตรฐาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GrowthChart childId={childId} data={childData} developments={developments} prediction={latestPrediction} />
        </CardContent>
      </Card>

      {/* AI Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>การทำนายการเจริญเติบโต</CardTitle>
          <CardDescription>
            คาดการณ์จากข้อมูลย้อนหลังและแสดงผลล่าสุดของเด็กคนนี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PredictionCard childId={childId} latestPrediction={latestPrediction} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการประเมินพัฒนาการ</CardTitle>
          <CardDescription>
            ผลเชิงลึกจากการตรวจวัดน้ำหนัก ส่วนสูงรายครั้ง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementHistory childId={childId} />
        </CardContent>
      </Card>
    </div>
  );
}
