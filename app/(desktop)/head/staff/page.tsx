import { UserAction } from "@/actions/UserAction";
import { DataTable } from "@/components/features/desktop/data-table";
import { columns } from "@/components/features/desktop/columns";
import StaffFilters from "@/components/features/desktop/StaffFilters";
import { UserResponse } from "@/dto";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function StaffPage({
  searchParams,
}: {
  searchParams: SearchParams;
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
    // Let the error boundary handle significant fetch errors if needed,
    // or handle gracefully.
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ข้อมูลเจ้าหน้าที่</h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลเจ้าหน้าที่ หัวหน้า และแอดมินในระบบ
        </p>
      </div>

      <StaffFilters />
      <DataTable columns={columns} data={users} />
    </div>
  );
}
