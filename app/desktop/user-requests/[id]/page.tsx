import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import { UserAction } from "@/actions/UserAction";
import { Request_status, Role } from "@/types/Enums";
import type { TeamResponse } from "@/dto";
import { UserRequestActionHandler } from "../../../../components/features/desktop/UserRequestActionHandler";
import { UserRequestRoleSelector } from "../../../../components/features/desktop/UserRequestRoleSelector";
import { UserRequestTeamSelector } from "../../../../components/features/desktop/UserRequestTeamSelector";
import { getCurrentSession } from "@/lib/auth/session.server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "รายละเอียดคำร้องขอเปิดบัญชี",
};

const STATUS_CONFIG = {
  [Request_status.APPROVE]: {
    label: "อนุมัติ",
    cls: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle2,
  },
  [Request_status.REJECT]: {
    label: "ปฏิเสธ",
    cls: "bg-red-100 text-red-600 border-red-300",
    icon: XCircle,
  },
  [Request_status.WAITING]: {
    label: "รอดำเนินการ",
    cls: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: Clock,
  },
};

export default async function UserRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/desktop/user-requests">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">กลับ</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            รายละเอียดคำร้อง
          </h2>
          <p className="text-muted-foreground mt-1">
            ข้อมูลคำร้องขอเปิดบัญชีผู้ใช้งาน
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
        <UserRequestDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function UserRequestDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  
  if (session?.user?.role !== Role.ADMIN) {
    redirect("/desktop/dashboard");
  }

  const { id } = await params;

  // id is now expected to be userId (UUID) to match backend requirements

  let request = null;
  let user = null;
  let teams: TeamResponse[] = [];

  try {
    request = await UserCreateStatusAction.getStatusById(id);

    if (request) {
      // Fetch user details
      try {
        user = await UserAction.getUserById(request.userId);
      } catch (e) {
        console.error("Failed to fetch user:", e);
      }

      // Fetch teams for the form
      const { TeamAction } = await import("@/actions/TeamAction");
      const teamsRes = await TeamAction.getTeams({ limit: 1000, page: 1 });
      if (teamsRes && teamsRes.data) {
        teams = teamsRes.data;
      }
    }
  } catch (error) {
    console.error("Failed to load request:", error);
  }

  if (!request) {
    notFound();
  }

  const statusCfg =
    STATUS_CONFIG[request.requestStatus] ??
    STATUS_CONFIG[Request_status.WAITING];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="w-full space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลผู้ขอเปิดบัญชี</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <dt className="text-sm text-muted-foreground font-medium mb-1.5">
                  ชื่อ-นามสกุล
                </dt>
                <dd className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium">
                  {user
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : request.userId}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground font-medium mb-1.5">
                  อีเมล
                </dt>
                <dd className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium">
                  {user?.email || "-"}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground font-medium mb-1.5">
                  ตำแหน่ง
                </dt>
                <UserRequestRoleSelector 
                  initialRole={Role.USER} 
                  initialTeamId={user?.teamId ? String(user.teamId) : ""}
                  isReadOnly={request.requestStatus !== Request_status.WAITING}
                />
              </div>

              <div>
                <dt className="text-sm text-muted-foreground font-medium mb-1.5">
                  ทีม
                </dt>
                <UserRequestTeamSelector 
                  teams={teams}
                  isReadOnly={request.requestStatus !== Request_status.WAITING}
                />
              </div>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground font-medium mb-1.5">
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

            {request.rejectReason && (
              <div>
                <dt className="text-sm text-muted-foreground font-medium mb-1.5">
                  เหตุผลที่ปฏิเสธ
                </dt>
                <dd className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium">
                  {request.rejectReason}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลเวลา</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="text-sm text-muted-foreground font-medium mb-1">
              วันที่ร้องขอ
            </dt>
            <dd className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium">
              {new Date(request.createdAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground font-medium mb-1">
              แก้ไขล่าสุด
            </dt>
            <dd className="rounded-lg border bg-muted/30 px-4 py-2.5 text-sm font-medium">
              {new Date(request.updatedAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>

          <div className="mt-8 pt-6 border-t">
            {request.requestStatus === Request_status.WAITING && (
              <UserRequestActionHandler requestId={id} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
