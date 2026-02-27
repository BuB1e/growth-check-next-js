import { Suspense } from "react";
import { ChildAction } from "@/actions/ChildAction";
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
import { ChildProfileForm } from "../../../../../components/features/desktop/ChildProfileForm";
import { MeasurementHistory } from "../../../../../components/features/desktop/MeasurementHistory";
import { GrowthChart } from "../../../../../components/features/desktop/GrowthChart";

export const metadata = {
  title: "รายละเอียดข้อมูลเด็ก",
};

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
          <Link href="/head/children">
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

  const child = await ChildAction.getChildById(childId);

  if (!child) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Personal Info Form */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
            <CardDescription>
              อัปเดตชื่อ นามสกุล และสถานที่เพื่อความถูกต้อง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChildProfileForm child={child} />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Graphs and History Table */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>แผนภูมิการเจริญเติบโต</CardTitle>
            <CardDescription>
              แสดงแนวโน้มน้ำหนักและส่วนสูงเทียบกับเกณฑ์มาตรฐาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GrowthChart childId={childId} />
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
    </div>
  );
}
