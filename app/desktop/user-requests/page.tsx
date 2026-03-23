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
import { UserAction } from "@/actions/UserAction";
import type { UserCreateStatusResponse, PaginatedResponseDTO, UserResponse } from "@/dto";
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

  // Default to WAITING status, no "all" option
  const requestStatus = (sp?.status as Request_status) || Request_status.WAITING;

  let data: PaginatedResponseDTO<UserCreateStatusResponse> | null = null;
  const usersMap: Map<string, UserResponse> = new Map();

  try {
    data = await UserCreateStatusAction.getStatuses({
      page,
      limit,
      q,
      status: requestStatus,
    });

    // Fetch users to map with userId for displaying names
    if (data && data.data && data.data.length > 0) {
      const userIds = data.data.map((req) => req.userId).filter(Boolean);
      if (userIds.length > 0) {
        // Fetch all users and create a map
        const allUsers = await UserAction.getUsers({ limit: 1000, page: 1 });
        allUsers.forEach((user) => {
          usersMap.set(user.id, user);
        });
      }
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

  // Pass usersMap to the table so it can display user names
  return <UserRequestsTable rawData={data} usersMap={usersMap} />;
}
