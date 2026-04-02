import React, { Suspense } from "react";
import { RegisterForm } from "@/components/features/register/RegisterForm";
import { TeamAction } from "@/actions/TeamAction";
import { TeamResponse } from "@/dto";
import { Loader2 } from "lucide-react";
import axios from "axios";

export const metadata = {
  title: "ลงทะเบียนใหม่ - Growth Check",
};

function isExpectedBuildAuthError(error: unknown): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" &&
    axios.isAxiosError(error) &&
    error.response?.status === 401
  );
}

function isExpectedRegisterAuthError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoadingSkeleton />}>
      <RegisterDataWrapper />
    </Suspense>
  );
}

function RegisterLoadingSkeleton() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary opacity-50" />
      <p className="text-xl">กำลังเตรียมข้อมูลการลงทะเบียน...</p>
    </div>
  );
}

async function RegisterDataWrapper() {
  // Fetch teams for the searchable dropdown
  // We fetch a high limit to ensure all teams are available for client-side search
  let teams: TeamResponse[] = [];
  try {
    const res = await TeamAction.getTeams(
      { limit: 1000, page: 1, deleted: false },
      {},
    );
    if (res && res.data) {
      teams = res.data;
    }
  } catch (error) {
    if (!isExpectedBuildAuthError(error) && !isExpectedRegisterAuthError(error)) {
      const errorMessage =
        error instanceof Error ? error.message : "unknown error";
      console.error(
        `Failed to fetch teams for registration: ${errorMessage}`,
      );
    }
  }

  return <RegisterForm teams={teams} />;
}
