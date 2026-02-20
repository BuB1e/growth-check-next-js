"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { AppRequest } from "@/types";
import { RequestStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RejectModal } from "@/components/features/admin/RejectModal";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  WAITING: "bg-amber-100 text-amber-700",
  APPROVE: "bg-green-100 text-green-700",
  REJECT: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  WAITING: "รอดำเนินการ",
  APPROVE: "อนุมัติแล้ว",
  REJECT: "ปฏิเสธแล้ว",
};

const typeLabel: Record<string, string> = {
  UserRegistration: "สมัครสมาชิก",
  LocationCreation: "สร้างชุมชน",
};

export function RequestTable() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery<AppRequest[]>({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/requests");
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/requests/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "requests"] });
    },
  });

  const handleApprove = (id: string) => {
    if (confirm("คุณต้องการอนุมัติคำร้องนี้หรือไม่?")) {
      approveMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้ร้องขอ</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.requester}</TableCell>
                <TableCell className="text-gray-500">
                  {typeLabel[req.type] || req.type}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusBadge[req.status],
                    )}
                  >
                    {statusLabel[req.status]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {req.status === RequestStatus.WAITING && (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApprove(String(req.id))}
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-1 h-4 w-4" />
                        )}
                        อนุมัติ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setRejectingId(String(req.id))}
                      >
                        <X className="mr-1 h-4 w-4" />
                        ปฏิเสธ
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RejectModal
        requestId={rejectingId}
        open={!!rejectingId}
        onOpenChange={(open) => {
          if (!open) setRejectingId(null);
        }}
      />
    </>
  );
}
