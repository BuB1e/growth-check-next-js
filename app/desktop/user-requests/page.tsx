import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import type { UserCreateStatusResponse, PaginatedResponseDTO, TeamResponse } from "@/dto";
import { Request_status } from "@/types/Enums";
import { UserRequestsTable } from "@/components/features/desktop/UserRequestsTable";

export const metadata = {
  title: "คำร้องขอเปิดบัญชีผู้ใช้งาน",
};

export default function UserRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">คำร้องเปิดบัญชี</h2>
          <p className="text-muted-foreground mt-1">
            รายการคำร้องขอเปิดบัญชีผู้ใช้งานใหม่จากพนักงานและเจ้าหน้าที่
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการคำร้องขอ</CardTitle>
          <CardDescription>
            คลิกที่ปุ่มจัดการเพื่อดูรายละเอียดและอนุมัติคำร้อง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableLoadingSkeleton />}>
            <RequestsDataWrapper searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูลคำร้องขอ...</p>
    </div>
  );
}

async function RequestsDataWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const { EnvConfig } = await import("@/configs/BackendConfig");
  const parsedPage = Number(sp?.page);
  const parsedLimit = Number(sp?.limit);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE;
  const q = typeof sp?.q === "string" ? sp.q : undefined;

  // Use WAITING as default status if not "all"
  const requestStatus = sp?.status === "all" ? undefined : (sp?.status as Request_status | undefined) || Request_status.WAITING;

  let data: PaginatedResponseDTO<UserCreateStatusResponse> | null = null;
  let teams: TeamResponse[] = [];

  try {
    data = await UserCreateStatusAction.getStatuses({
      page,
      limit,
      q,
      status: requestStatus, // Passed to API
      // role: role as any // The DTO might not have role yet, but we'll check
    });

    // Also fetch teams for the modal dropdown
    const { TeamAction } = await import("@/actions/TeamAction");
    const teamsRes = await TeamAction.getTeams({ limit: 1000, page: 1 });
    if (teamsRes && teamsRes.data) {
      teams = teamsRes.data;
    }
  } catch (error) {
    console.error("Failed to load requests:", error);
  }

  if (!data) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm font-medium">
        ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  // Pass teams to the table so the modal can use them
  return <UserRequestsTable rawData={data} teams={teams} />;
}
