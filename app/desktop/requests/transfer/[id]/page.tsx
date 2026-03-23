import { Suspense } from "react";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
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
import { ChildTransferRequestAction } from "@/actions/ChildTransferRequestAction";
import { Request_status } from "@/types";

export const metadata = {
  title: "รายละเอียดคำร้องขอย้ายเด็ก",
};

export default function TransferRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/desktop/requests?type=transfer">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">กลับ</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            รายละเอียดคำร้องขอย้ายเด็ก
          </h2>
          <p className="text-muted-foreground mt-1">
            ข้อมูลคำร้องขอย้ายเด็กระหว่างสถานที่ (ดูได้อย่างเดียว)
          </p>
        </div>
      </div>

      <Suspense fallback={<DetailSkeleton />}>
        <TransferRequestDetailContent params={params} />
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

const STATUS_CONFIG = {
  [Request_status.WAITING]: {
    label: "รอดำเนินการ",
    cls: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: Clock,
  },
  [Request_status.APPROVE]: {
    label: "อนุมัติแล้ว",
    cls: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle2,
  },
  [Request_status.REJECT]: {
    label: "ปฏิเสธ",
    cls: "bg-red-100 text-red-600 border-red-300",
    icon: XCircle,
  },
};

async function TransferRequestDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqId = parseInt(id, 10);

  if (isNaN(reqId)) notFound();

  const request = await ChildTransferRequestAction.getRequestById(reqId.toString());
  if (!request) notFound();

  // Determine status: no handledBy = WAITING, has handledBy = APPROVE
  const status = !request.handledBy 
    ? Request_status.WAITING 
    : Request_status.APPROVE;
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[Request_status.WAITING];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการย้ายเด็ก</CardTitle>
            <CardDescription>รายละเอียดคำร้องขอย้ายเด็ก</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-base">
              <InfoRow
                label="รหัสเด็ก"
                value={request.childId.toString()}
              />
              <InfoRow
                label="ผู้ยื่นคำร้อง"
                value={request.userId}
              />
              <InfoRow
                label="จากสถานที่ (ID)"
                value={request.fromLocation.toString()}
              />
              <InfoRow
                label="ไปยังสถานที่ (ID)"
                value={request.toLocation.toString()}
              />
            </dl>
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusCfg.cls}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusCfg.label}
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