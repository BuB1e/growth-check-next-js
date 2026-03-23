import { Suspense } from "react";
import { Loader2, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import { Request_status } from "@/types";

export const metadata = {
  title: "รายละเอียดคำร้องขอสร้างสถานที่",
};

export default function LocationRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
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
            ข้อมูลคำร้องขอสร้างสถานที่ (ดูได้อย่างเดียว)
          </p>
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
  const { id } = await params;
  const reqId = parseInt(id, 10);

  if (isNaN(reqId)) notFound();

  const request = await LocationCreateRequestAction.getRequestById(reqId);
  if (!request) notFound();

  const fullAddress = `ต.${request.sub_district} อ.${request.district} จ.${request.province} ${request.zip_code}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลสถานที่ที่ร้องขอ</CardTitle>
            <CardDescription>รายละเอียดที่เจ้าหน้าที่ส่งมา</CardDescription>
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

            {request.locationMap && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Google Maps / ลิงก์พิกัด
                </p>
                <a
                  href={request.locationMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                >
                  เปิดแผนที่
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>สถานะคำร้อง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-semibold ${STATUS_CLASS[request.requestStatus] ?? STATUS_CLASS[Request_status.WAITING]}`}
            >
              {STATUS_LABEL[request.requestStatus] ?? request.requestStatus}
            </div>
            {request.handledBy && (
              <InfoRow label="ดำเนินการโดย" value={request.handledBy} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลเวลา</CardTitle>
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
            <InfoRow label="รหัสผู้ยื่น" value={request.userId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd className="mt-1 font-medium text-base">{value || "—"}</dd>
    </div>
  );
}