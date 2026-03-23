import { Suspense } from "react";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryAction } from "@/actions/HistoryAction";
import type { HistoryType } from "@/dto";
import { Role } from "@/types";

export const metadata = {
  title: "รายละเอียดประวัติ",
};

export default function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/history">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">กลับ</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            รายละเอียด
          </h2>
          <p className="text-muted-foreground mt-1">
            ข้อมูลการดำเนินการ (ดูได้อย่างเดียว)
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-muted-foreground animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary opacity-50" />
            กำลังโหลด...
          </div>
        }
      >
        <HistoryDetailContent params={params} />
      </Suspense>
    </div>
  );
}

const STATUS_CONFIG = {
  APPROVED: {
    label: "อนุมัติ",
    cls: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "ปฏิเสธ",
    cls: "bg-red-100 text-red-600 border-red-300",
    icon: XCircle,
  },
  WAITING: {
    label: "รอดำเนินการ",
    cls: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: Clock,
  },
};

const TYPE_LABEL: Record<HistoryType, string> = {
  TRANSFER: "ย้ายเด็ก",
  LOCATION_APPROVE: "อนุมัติสร้างสถานที่",
  LOCATION_REJECT: "ปฏิเสธคำร้องสร้างสถานที่",
};

async function HistoryDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entryId = parseInt(id, 10);
  if (isNaN(entryId)) notFound();

  const entry = await HistoryAction.getHistoryById(entryId);
  if (!entry) notFound();

  const statusCfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.WAITING;
  const StatusIcon = statusCfg.icon;

  const actorPosition =
    entry.actor.role == Role.ADMIN
      ? "Admin"
      : `${entry.actor.role} ${entry.actor.locationName ?? ""}`.trim();

  return (
    <div className="w-full space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลการดำเนินการ</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-5">
            <ReadOnlyField label="หัวข้อ" value={entry.title} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <ReadOnlyField label="ทำเรื่องโดย" value={entry.actor.name} />
              <ReadOnlyField label="ตำแหน่ง" value={actorPosition} />

              {entry.type === "TRANSFER" && (
                <>
                  <ReadOnlyField
                    label="ย้ายจาก"
                    value={entry.fromLocation ?? "—"}
                  />
                  <ReadOnlyField
                    label="ย้ายไป"
                    value={entry.toLocation ?? "—"}
                  />
                  <ReadOnlyField
                    label="ชื่อจริง (เด็ก)"
                    value={entry.childFirstName ?? "—"}
                  />
                  <ReadOnlyField
                    label="นามสกุล (เด็ก)"
                    value={entry.childLastName ?? "—"}
                  />
                </>
              )}

              {(entry.type === "LOCATION_APPROVE" ||
                entry.type === "LOCATION_REJECT") && (
                <ReadOnlyField
                  label="ชื่อสถานที่"
                  value={entry.locationName ?? "—"}
                />
              )}

              <div>
                <dt className="text-xs text-muted-foreground font-medium mb-1">
                  สถานะ
                </dt>
                <dd>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${statusCfg.cls}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusCfg.label}
                  </span>
                </dd>
              </div>

              <ReadOnlyField
                label="ประเภท"
                value={TYPE_LABEL[entry.type] ?? entry.type}
              />
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลเวลา</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <ReadOnlyField
            label="วันที่ดำเนินการ"
            value={new Date(entry.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <ReadOnlyField
            label="แก้ไขล่าสุด"
            value={new Date(entry.updatedAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground font-medium mb-1.5">
        {label}
      </label>
      <div className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground wrap-break-word">
        {value || "—"}
      </div>
    </div>
  );
}
