"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserCreateStatusResponse } from "@/dto";
import type { PaginatedResponseDTO, UserResponse } from "@/dto";
import { Request_status, Role, RoleTH } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatBE } from "@/lib/date-utils";
import { bulkUpdateUserRequestStatusAction } from "@/app/desktop/user-requests/action";

interface UserRequestsTableProps {
  rawData: PaginatedResponseDTO<UserCreateStatusResponse>;
  usersMap?: Map<string, UserResponse>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case Request_status.APPROVE:
      return (
        <div className="flex items-center gap-1.5 text-green-600 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          อนุมัติแล้ว
        </div>
      );
    case Request_status.REJECT:
      return (
        <div className="flex items-center gap-1.5 text-red-500 font-medium">
          <XCircle className="h-4 w-4" />
          ปฏิเสธ
        </div>
      );
    case Request_status.WAITING:
    default:
      return (
        <div className="flex items-center gap-1.5 text-yellow-500 font-medium">
          <Clock className="h-4 w-4" />
          รอดำเนินการ
        </div>
      );
  }
}

export function UserRequestsTable({ rawData, usersMap = new Map() }: UserRequestsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || Request_status.WAITING,
  );
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get("role") || "all",
  );

  // Note: Modal removed - using detail page at /desktop/user-requests/[id] instead

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<Request_status | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams({ q: searchQuery || null, page: "1" });
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    updateURLParams({ status: val, page: "1" });
  };

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    updateURLParams({ role: val === "all" ? null : val, page: "1" });
  };

  // Toggle single row selection
  const toggleRow = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  // Toggle all rows
  const toggleAll = () => {
    if (selectedIds.size === rawData.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rawData.data.map(r => r.userId)));
    }
  };

  // Handle bulk action confirmation
  const handleBulkAction = async () => {
    if (!confirmAction || selectedIds.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      const result = await bulkUpdateUserRequestStatusAction(
        Array.from(selectedIds),
        confirmAction
      );
      
      if (result.success) {
        console.log(`[Bulk Action] Success: Updated ${selectedIds.size} requests`);
        setSelectedIds(new Set());
      } else {
        console.error(`[Bulk Action] Error: ${result.error || "Unknown error"}`);
        alert(result.error || "เกิดข้อผิดพลาดในการดำเนินการแบบกลุ่ม");
      }
    } catch (error) {
      console.error(`[Bulk Action] Unexpected error:`, error);
      alert("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setIsProcessing(true); // Keep processing true until next navigation? No, result.success handled it.
      // Wait, result.success will trigger revalidatePath on server.
      // The component will re-render with new data if the parent (page) re-fetches.
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  const columns: ColumnDef<UserCreateStatusResponse>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedIds.size === rawData.data.length && rawData.data.length > 0}
          onCheckedChange={toggleAll}
          aria-label="เลือกทั้งหมด"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.userId)}
          onCheckedChange={() => toggleRow(row.original.userId)}
          onClick={(e) => e.stopPropagation()}
          aria-label="เลือกรายการ"
        />
      ),
      size: 40,
    },
    {
      accessorKey: "firstName",
      header: "ชื่อจริง",
      cell: ({ row }) => {
        // Use usersMap to get user name
        const user = usersMap.get(row.original.userId);
        if (user) {
          return user.firstName.trim();
        }
        // Fallback or mapped from backend if available inside user object.
        const req = row.original as UserCreateStatusResponse & {
          user?: { firstName: string };
          firstName?: string;
        };
        if (req.user && req.user.firstName) {
          return req.user.firstName.trim();
        }
        if (req.firstName) {
          return req.firstName.trim();
        }
        return (
          <span className="text-gray-500 italic">
            User ID: {row.original.userId.substring(0, 8)}...
          </span>
        );
      },
    },
    {
      accessorKey: "lastName",
      header: "นามสกุล",
      cell: ({ row }) => {
        // Use usersMap to get user name
        const user = usersMap.get(row.original.userId);
        if (user) {
          return user.lastName.trim();
        }
        // Fallback or mapped from backend if available inside user object.
        const req = row.original as UserCreateStatusResponse & {
          user?: { lastName: string };
          lastName?: string;
        };
        if (req.user && req.user.lastName) {
          return req.user.lastName.trim();
        }
        if (req.lastName) {
          return req.lastName.trim();
        }
        return (
          <span className="text-gray-500 italic">
            User ID: {row.original.userId.substring(0, 8)}...
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "วันที่ร้องขอ",
      cell: ({ row }) => formatBE(row.original.createdAt, "d MMM yyyy"),
    },
    {
      accessorKey: "requestStatus",
      header: "สถานะคำร้อง",
      cell: ({ row }) => <StatusBadge status={row.original.requestStatus} />,
    },
    // "จัดการ" column removed - click row to navigate to detail page
  ];

  const table = useReactTable({
    data: rawData.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentPage = rawData.meta.page;
  const totalPages = rawData.meta.totalPages;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-between">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 flex-wrap"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64 md:w-80"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            ค้นหา
          </Button>
        </form>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="สถานะคำร้อง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Request_status.WAITING}>
                รอดำเนินการ
              </SelectItem>
              <SelectItem value={Request_status.APPROVE}>
                อนุมัติแล้ว
              </SelectItem>
              <SelectItem value={Request_status.REJECT}>ปฏิเสธ</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="ตำแหน่ง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
              <SelectItem value={Role.HEAD}>{RoleTH.HEAD} (Head)</SelectItem>
              <SelectItem value={Role.USER}>{RoleTH.USER} (Staff)</SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Action Buttons - show when items are selected */}
          {selectedIds.size > 0 && (
            <div className="flex gap-2 ml-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setConfirmAction(Request_status.APPROVE)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                อนุมัติ ({selectedIds.size})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmAction(Request_status.REJECT)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                ปฏิเสธ ({selectedIds.size})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table with clickable rows */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/desktop/user-requests/${row.original.userId}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    ไม่พบข้อมูลคำร้องขอ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            พบ {rawData.meta.total} รายการ
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateURLParams({ page: (currentPage - 1).toString() })
              }
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">หน้าก่อนหน้า</span>
            </Button>
            <span className="text-sm font-medium">
              หน้าที่ {currentPage} จาก {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateURLParams({ page: (currentPage + 1).toString() })
              }
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">หน้าถัดไป</span>
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === Request_status.APPROVE ? "ยืนยันการอนุมัติ" : "ยืนยันการปฏิเสธ"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการ{confirmAction === Request_status.APPROVE ? "อนุมัติ" : "ปฏิเสธ"} {selectedIds.size} คำร้องใช่หรือไม่?
              {confirmAction === Request_status.REJECT && " ผู้ใช้งานจะได้รับแจ้งว่าคำร้องถูกปฏิเสธ"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              disabled={isProcessing}
              className={confirmAction === Request_status.APPROVE ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isProcessing ? "กำลังดำเนินการ..." : confirmAction === Request_status.APPROVE ? "อนุมัติ" : "ปฏิเสธ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
