import { Suspense } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import { UserAction } from "@/actions/UserAction";
import { Request_status, Role } from "@/types";
import { getCurrentSession } from "@/lib/auth/session.server";
import { RequestActionButtons } from "../../_components/RequestActionButtons";

export const metadata = {
  title: "รายละเอียดคำร้องขอสร้างสถานที่",
};

export default async function LocationRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/desktop/requests?type=location">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">กลับ</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              รายละเอียดคำร้องขอ
            </h2>
            <p className="text-muted-foreground mt-1">
              ข้อมูลคำร้องขอสร้างสถานที่
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<DetailSkeleton />}>
        <LocationRequestDetailContent params={params} />
      </Suspense>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดรายละเอียด...</p>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  [Request_status.WAITING]: "รอดำเนินการ",
  [Request_status.APPROVE]: "อนุมัติแล้ว",
  [Request_status.REJECT]: "ปฏิเสธ",
};

const STATUS_CLASS: Record<string, string> = {
  [Request_status.WAITING]: "bg-yellow-100 text-yellow-700 border-yellow-300",
  [Request_status.APPROVE]: "bg-green-100 text-green-700 border-green-300",
  [Request_status.REJECT]: "bg-red-100 text-red-600 border-red-300",
};

async function LocationRequestDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === Role.ADMIN;
  const currentUserId = session?.user?.id;

  const { id } = await params;
  const reqId = parseInt(id, 10);

  if (isNaN(reqId)) notFound();

  const request = await LocationCreateRequestAction.getRequestById(reqId);
  if (!request) notFound();

  // Fetch names in parallel
  const [user, handler] = await Promise.all([
    UserAction.getUserById(request.userId).catch(() => null),
    request.handledBy ? UserAction.getUserById(request.handledBy).catch(() => null) : Promise.resolve(null),
  ]);

  const userName = user ? `${user.firstName} ${user.lastName}` : request.userId;
  const handlerName = handler ? `${handler.firstName} ${handler.lastName}` : request.handledBy;

  const fullAddress = `ต.${request.sub_district} อ.${request.district} จ.${request.province} ${request.zip_code}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card className="shadow-md">
          <CardHeader className="pb-6 border-b">
            <CardTitle className="text-3xl font-bold">ข้อมูลสถานที่ที่ร้องขอ</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-base">
              <InfoRow
                label="ชื่อสถานที่ (ที่ขอสร้าง)"
                value={request.locationName}
              />
              <InfoRow label="ตำบล / แขวง" value={request.sub_district} />
              <InfoRow label="อำเภอ / เขต" value={request.district} />
              <InfoRow label="จังหวัด" value={request.province} />
              <InfoRow label="รหัสไปรษณีย์" value={request.zip_code} />
              <InfoRow label="ที่อยู่เต็ม" value={fullAddress} />
            </dl>
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-muted/30">
            <CardTitle className="text-2xl">สถานะคำร้อง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full border text-base font-bold shadow-sm ${STATUS_CLASS[request.status] ?? STATUS_CLASS[Request_status.WAITING]}`}
              >
                {STATUS_LABEL[request.status] ?? request.status}
              </div>

              {isAdmin && request.status === Request_status.WAITING && currentUserId && (
                <RequestActionButtons
                  id={request.id}
                  type="location"
                  handlerId={currentUserId}
                />
              )}
            </div>
            {request.handledBy && (
              <InfoRow label="ดำเนินการโดย" value={handlerName || request.handledBy} />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-muted/30">
            <CardTitle className="text-2xl">ข้อมูลเวลา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InfoRow
              label="วันที่ร้องขอ"
              value={new Date(request.createdAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow
              label="แก้ไขล่าสุด"
              value={new Date(request.updatedAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow label="ผู้ยื่นคำร้อง" value={userName} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-2">
      <dt className="text-base font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-lg text-foreground">{value || "—"}</dd>
    </div>
  );
}
