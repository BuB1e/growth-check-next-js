import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { checkUserStatus } from "@/lib/auth/auth-guard";
import { UserAction } from "@/actions/UserAction";
import { TeamAction } from "@/actions/TeamAction";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { Request_status } from "@/types/Enums";
import type { UserCreateStatusResponse } from "@/dto";

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<PendingApprovalLoading />}>
      <PendingApprovalContent />
    </Suspense>
  );
}

function PendingApprovalLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <div className="h-10 w-10 animate-spin mb-4 text-primary opacity-50" />
      <p className="text-xl">กำลังตรวจสอบสถานะบัญชี...</p>
    </div>
  );
}

async function PendingApprovalContent() {
  const authStatus = await checkUserStatus();

  // If already approved, go home
  if (authStatus.status === Request_status.APPROVE) {
    redirect("/mobile/staff/home");
  }

  // If not logged in, go login
  if (authStatus.status === "UNAUTHENTICATED") {
    redirect("/login");
  }

  // If error, show error
  if (authStatus.status === "ERROR") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-red-50 text-red-900">
        <div className="max-w-md text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold">
            เกิดข้อผิดพลาดในการตรวจสอบบัญชี
          </h2>
          <p>
            {authStatus.status === "ERROR"
              ? authStatus.message
              : "Unexpected error"}
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/login">กลับไปหน้าล็อกอิน</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isRejected = authStatus.status === Request_status.REJECT;
  const statusRes = authStatus as { 
    status: string; 
    user: { id: string; email: string; name?: string; firstName?: string; lastName?: string; teamId?: number | string | null }; 
    requestStatus?: UserCreateStatusResponse;
  };
  const user = statusRes.user;
  const statusInfo = statusRes.requestStatus;

  // Fetch fresh user data and team name for display
  let freshUser = user;
  let teamName = "ไม่ระบุ";
  try {
    const headersList = await headers();
    const forwardHeaders = {
      cookie: headersList.get("cookie") || "",
      "user-agent": headersList.get("user-agent") || "",
    };

    // Fetch fresh user to get firstName/lastName/teamId
    const userData = await UserAction.getUserById(user.id, forwardHeaders);
    if (userData) {
      freshUser = userData;
      if (userData.teamId) {
        const teamData = await TeamAction.getTeamById(
          userData.teamId,
          forwardHeaders,
        );
        if (teamData) {
          teamName = teamData.name;
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch fresh user/team data:", e);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50/50 p-4 md:p-8">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Growth Check
          </h1>
        </div>

        <Card className="border-none shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
          <CardHeader className="pt-10 pb-6 text-center space-y-2">
            <div className="flex justify-center mb-4">
              {isRejected ? (
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-yellow-600 animate-pulse" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isRejected
                ? "บัญชีของคุณไม่ได้รับการอนุมัติ"
                : "รอการอนุมัติบัญชี"}
            </CardTitle>
            <CardDescription className="text-lg text-gray-500">
              {isRejected
                ? "ขออภัย บัญชีของคุณไม่ผ่านการตรวจสอบจากผู้ดูแลระบบ"
                : "ขณะนี้เจ้าหน้าที่กำลังตรวจสอบข้อมูลการลงทะเบียนของคุณ"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-10 px-6 md:px-10 text-center">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4 text-left">
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {freshUser.firstName && freshUser.lastName
                    ? `${freshUser.firstName} ${freshUser.lastName}`
                    : freshUser.name || freshUser.email}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  เขต/ทีมที่สังกัด
                </p>
                <p className="text-xl font-bold text-primary">{teamName}</p>
              </div>

              <div className="pt-2 border-t border-gray-200/60">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-600">อีเมล:</span>{" "}
                  {freshUser.email}
                </p>
              </div>

              {isRejected && statusInfo?.rejectReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 mt-2">
                  <p className="text-red-700">
                    <span className="font-bold">เหตุผลที่ไม่อนุมัติ:</span>{" "}
                    {statusInfo.rejectReason}
                  </p>
                </div>
              )}
            </div>

            <p className="text-gray-500">
              {isRejected
                ? "หากคุณคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อหัวหน้าเขตหรือเจ้าหน้าที่ดูแลระบบ"
                : "คุณจะสามารถเข้าใช้งานระบบได้ทันทีหลังจากที่เจ้าหน้าที่กดอนุมัติ"}
            </p>

            <div className="flex flex-col gap-3">
              <SignOutButton />

              <Button
                variant="ghost"
                className="h-12 rounded-xl text-lg text-gray-500 hover:text-gray-700"
                asChild
              >
                <Link href="/login">กลับไปยังหน้าเข้าสู่ระบบ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
