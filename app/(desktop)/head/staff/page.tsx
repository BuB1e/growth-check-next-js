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
import { UserResponse } from "@/dto";
import { DataTable } from "@/components/features/desktop/data-table";
import { columns } from "@/components/features/desktop/columns";
import StaffFilters from "@/components/features/desktop/StaffFilters";

export const metadata = {
  title: "ข้อมูลเจ้าหน้าที่",
};

export default function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            ข้อมูลเจ้าหน้าที่
          </h2>
          <p className="text-muted-foreground mt-1">
            จัดการข้อมูลเจ้าหน้าที่ หัวหน้า และแอดมินในระบบ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการเจ้าหน้าที่</CardTitle>
          <CardDescription>
            คลิกที่หัวคอลัมน์เพื่อจัดเรียง · ใช้ช่องค้นหาเพื่อกรองข้อมูล
          </CardDescription>
        </CardHeader>
        <CardContent>
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

  const search = typeof params.search === "string" ? params.search : undefined;
  const orderBy =
    typeof params.orderBy === "string" ? params.orderBy : undefined;
  const orderDirection =
    params.orderDirection === "desc" || params.orderDirection === "asc"
      ? params.orderDirection
      : undefined;
  const roleRaw = typeof params.role === "string" ? params.role : undefined;
  const role =
    roleRaw === "ADMIN" || roleRaw === "USER" || roleRaw === "HEAD"
      ? roleRaw
      : undefined;

  let users: UserResponse[] = [];

  try {
    users = await UserAction.getUsers({
      search,
      orderBy,
      orderDirection,
      role,
    });
  } catch (error) {
    console.error("Failed to fetch staff data:", error);
  }

  if (!users.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        ไม่พบข้อมูลเจ้าหน้าที่
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StaffFilters />
      <DataTable columns={columns} data={users} />
    </div>
  );
}
