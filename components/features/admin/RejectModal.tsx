"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const rejectReasons = [
  "ข้อมูลไม่ครบถ้วน",
  "ไม่ตรงตามเกณฑ์",
  "ซ้ำกับคำร้องอื่น",
  "พื้นที่ไม่ตรง",
  "อื่นๆ",
];

const rejectSchema = z.object({
  reasonCategory: z.string().min(1, "กรุณาเลือกเหตุผล"),
  reasonDetail: z.string().optional(),
  combinedReason: z.string().min(10, "เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร"),
});

interface RejectModalProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectModal({
  requestId,
  open,
  onOpenChange,
}: RejectModalProps) {
  const queryClient = useQueryClient();
  const [reasonCategory, setReasonCategory] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (reason: string) => {
      await apiClient.post(`/admin/requests/${requestId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "requests"] });
      resetForm();
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setReasonCategory("");
    setReasonDetail("");
    setError("");
  };

  const handleSubmit = () => {
    setError("");

    const combinedReason = reasonDetail
      ? `${reasonCategory}: ${reasonDetail}`
      : reasonCategory;

    const parsed = rejectSchema.safeParse({
      reasonCategory,
      reasonDetail,
      combinedReason,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      setError(firstError.message);
      return;
    }

    mutation.mutate(combinedReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ปฏิเสธคำร้อง</DialogTitle>
          <DialogDescription>กรุณาระบุเหตุผลในการปฏิเสธ</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {mutation.isError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              ปฏิเสธคำร้องไม่สำเร็จ กรุณาลองใหม่
            </div>
          )}

          <div className="space-y-2">
            <Label>หมวดหมู่เหตุผล *</Label>
            <Select value={reasonCategory} onValueChange={setReasonCategory}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกเหตุผล" />
              </SelectTrigger>
              <SelectContent>
                {rejectReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>รายละเอียดเพิ่มเติม (ถ้ามี)</Label>
            <Textarea
              placeholder="ระบุรายละเอียดเพิ่มเติม..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={mutation.isPending || !reasonCategory}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            ยืนยันการปฏิเสธ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
