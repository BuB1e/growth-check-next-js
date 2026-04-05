import { notFound } from "next/navigation";
import { UserAction } from "@/actions/UserAction";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StaffDetailClient from "./StaffDetailClient";

export const metadata = {
  title: "รายละเอียดเจ้าหน้าที่",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function StaffDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<DetailLoadingSkeleton />}>
      <StaffDetailContent params={params} />
    </Suspense>
  );
}

async function StaffDetailContent({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  let user;

  try {
    user = await UserAction.getUserById(id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    console.error(`Failed to fetch staff member: ${errorMessage}`);
    notFound();
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/desktop/staff">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">รายละเอียดเจ้าหน้าที่</h2>
            <p className="text-muted-foreground mt-1">
              ดูข้อมูลและจัดการสิทธิ์การใช้งานของบุคลากร
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 text-2xl font-bold">
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            <CardDescription>ข้อมูลส่วนตัวและรายละเอียดการติดต่อ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-3">
              <div className="text-sm font-medium text-slate-500">ชื่อ-นามสกุล</div>
              <div className="text-sm font-semibold">{user.firstName} {user.lastName}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-3">
              <div className="text-sm font-medium text-slate-500">อีเมล</div>
              <div className="text-sm font-semibold truncate text-blue-600">{user.email}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-3 text-slate-400">
              <div className="text-sm font-medium">รหัสเจ้าหน้าที่ ID</div>
              <div className="text-sm font-semibold">#{user.id}</div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions Card (Client Side Editor) */}
        <StaffDetailClient user={user} />
      </div>
    </div>
  );
}

function DetailLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-24 text-muted-foreground animate-pulse bg-white border rounded-xl">
      <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary opacity-50" />
      <p className="text-lg">กำลังโหลดข้อมูลเจ้าหน้าที่...</p>
    </div>
  );
}
