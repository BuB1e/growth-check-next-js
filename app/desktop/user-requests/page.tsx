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
import { Request_status, Role } from "@/types/Enums";
import { UserRequestsTable } from "@/components/features/desktop/UserRequestsTable";
import { getCurrentSession } from "@/lib/auth/session.server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "คำร้องขอเปิดบัญชีผู้ใช้งาน",
};

export default async function UserRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-10 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-display-lg text-on-surface font-bold tracking-tight">
          คำร้องเปิดบัญชีข้อมูลพนักงาน
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          ตรวจสอบและอนุมัติสิทธิ์การเข้าถึงระบบสำหรับบุคลากรใหม่ เพื่อความปลอดภัยและความถูกต้องของข้อมูล
        </p>
      </div>

      <Card className="border-0 shadow-lg mt-8">
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-headline-md font-bold">รายการที่รอดำเนินการ</CardTitle>
          <CardDescription className="text-body-lg mt-1">
            ท่านสามารถตรวจสอบประวัติหรือเลือกจัดการคำร้องได้จากตารางด้านล่าง
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
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
  const session = await getCurrentSession();
  if (session?.user?.role !== Role.ADMIN) {
    redirect("/desktop/dashboard");
  }

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
  const normalizedQ = q?.trim().toLowerCase();
  const roleRaw = typeof sp?.role === "string" ? sp.role : undefined;
  const role =
    roleRaw === Role.USER || roleRaw === Role.HEAD || roleRaw === Role.ADMIN
      ? roleRaw
      : undefined;

  // Default to WAITING status, no "all" option
  const requestStatus = (sp?.status as Request_status) || Request_status.WAITING;
  const queryPage = page;
  const queryLimit = limit;
  const fetchPage = normalizedQ ? 1 : queryPage;
  const fetchLimit = normalizedQ ? 1000 : queryLimit;

  let data: PaginatedResponseDTO<UserCreateStatusResponse> | null = null;
  const usersMap: Map<string, UserResponse> = new Map();

  try {
    try {
      data = await UserCreateStatusAction.getStatuses({
        page: fetchPage,
        limit: fetchLimit,
        q,
        role,
        status: requestStatus,
      });
    } catch (error) {
      if (!normalizedQ) {
        throw error;
      }

      data = await UserCreateStatusAction.getStatuses({
        page: fetchPage,
        limit: fetchLimit,
        role,
        status: requestStatus,
      });
    }

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

      if (normalizedQ) {
        const filtered = data.data.filter((request) => {
          const user = usersMap.get(request.userId);
          if (!user) {
            return false;
          }

          const fullName = `${user.firstName} ${user.lastName}`.trim().toLowerCase();
          const email = user.email.toLowerCase();
          return fullName.includes(normalizedQ) || email.includes(normalizedQ);
        });
        const start = (queryPage - 1) * queryLimit;
        const end = start + queryLimit;
        const pagedFiltered = filtered.slice(start, end);

        data = {
          data: pagedFiltered,
          meta: {
            ...data.meta,
            total: filtered.length,
            totalPages: filtered.length > 0 ? Math.ceil(filtered.length / queryLimit) : 0,
            page: queryPage,
            limit: queryLimit,
          },
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    console.error(`Failed to load requests: ${errorMessage}`);
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
