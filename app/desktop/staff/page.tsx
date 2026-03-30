import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UserAction } from "@/actions/UserAction";
import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import { UserResponse, UserCreateStatusResponse, PaginatedMetaDTO } from "@/dto";
import { columns } from "@/components/features/desktop/columns";
import { StaffTable } from "@/components/features/desktop/StaffTable";
import StaffFilters from "@/components/features/desktop/StaffFilters";
import { Role, Request_status } from "@/types/Enums";
import { EnvConfig } from "@/configs/BackendConfig";

export const metadata = {
  title: "ข้อมูลเจ้าหน้าที่",
};

export default function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-10 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-display-lg text-on-surface font-bold tracking-tight">
          การจัดการบุคลากร
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          บริหารจัดการข้อมูลเจ้าหน้าที่ หัวหน้างาน และผู้ดูแลระบบ เพื่อกำหนดสิทธิ์และขอบเขตความรับผิดชอบในแต่ละพื้นที่
        </p>
      </div>

      <Card className="border-0 shadow-lg mt-4">
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-headline-md font-bold">บัญชีรายชื่อบุคลากร</CardTitle>
          <CardDescription className="text-body-lg mt-1">
            ท่านสามารถค้นหาตามชื่อ บทบาท หรือสถานะการปฏิบัติงานได้จากตารางด้านล่าง
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Suspense fallback={<TableLoadingSkeleton />}>
            <StaffDataWrapper searchParams={searchParams} />
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
      <p>กำลังโหลดข้อมูลเจ้าหน้าที่...</p>
    </div>
  );
}

async function StaffDataWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const parsedPage = Number(params.page);
  const parsedLimit = Number(params.limit);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE;

  const q = typeof params.q === "string" ? params.q : undefined;
  const roleRaw = typeof params.role === "string" ? params.role : undefined;
  const role =
    roleRaw === Role.ADMIN || roleRaw === Role.USER || roleRaw === Role.HEAD
      ? (roleRaw as Role)
      : undefined;

  let users: UserResponse[] = [];
  let meta: PaginatedMetaDTO | undefined;

  try {
    // 1. Fetch only APPROVED user statuses from the backend.
    const statusesResponse = await UserCreateStatusAction.getStatuses({
      page,
      limit,
      q,
      role: role as string,
      status: Request_status.APPROVE,
    });

    meta = statusesResponse.meta;

    if (statusesResponse.data && statusesResponse.data.length > 0) {
      // 2. Fetch details ONLY for the users in the current page.
      const userIds = Array.from(new Set(statusesResponse.data.map(s => s.userId)));
      const userResults = await Promise.allSettled(
        userIds.map(id => UserAction.getUserById(id))
      );
      
      const userMap = new Map<string, UserResponse>();
      userResults.forEach((res, index) => {
        if (res.status === "fulfilled" && res.value) {
          userMap.set(userIds[index], res.value);
        }
      });
      
      users = statusesResponse.data
        .map((status: UserCreateStatusResponse) => userMap.get(status.userId))
        .filter((user: UserResponse | undefined): user is UserResponse => !!user);
    }
  } catch (error) {
    console.error("Failed to fetch staff data:", error);
  }

  if (!meta || meta.total === 0) {
    return (
      <div className="space-y-4">
        <StaffFilters />
        <div className="text-center py-16 text-muted-foreground">
          ไม่พบข้อมูลเจ้าหน้าที่
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StaffFilters />
      <StaffTable data={users} meta={meta} />
    </div>
  );
}
