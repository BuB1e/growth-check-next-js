"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Request_status } from "@/types";
import { updateUserRequestStatusAction } from "../../../app/desktop/user-requests/action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useUserRequestStore } from "@/stores/UserRequestStore";

interface UserRequestActionHandlerProps {
  requestId: string;
}

export function UserRequestActionHandler({
  requestId,
}: UserRequestActionHandlerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { selectedRole, selectedTeamId } = useUserRequestStore();

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await updateUserRequestStatusAction(requestId, {
        requestStatus: Request_status.APPROVE,
        role: selectedRole,
        teamId: selectedTeamId ? Number(selectedTeamId) : undefined,
      });

      if (!result.success) {
        setError(result.error || "เกิดข้อผิดพลาดในการอนุมัติ");
      }
    } catch (err) {
      console.error("[UserRequestActionHandler] Approve Error:", err);
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await updateUserRequestStatusAction(requestId, {
        requestStatus: Request_status.REJECT,
        rejectReason,
      });

      if (!result.success) {
        setError(result.error || "เกิดข้อผิดพลาดในการปฏิเสธ");
      }
    } catch (err) {
      console.error("[UserRequestActionHandler] Reject Error:", err);
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold text-red-800">เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription className="font-medium text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {showRejectInput && (
        <div className="p-6 rounded-xl border border-red-200 bg-red-50/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <h4 className="font-bold text-red-900">ระบุเหตุผลในการปฏิเสธคำร้อง</h4>
          </div>
          <Input 
            placeholder="เช่น ข้อมูลไม่ครบถ้วน, เอกสารไม่ถูกต้อง..." 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="bg-white border-red-200 h-11 shadow-sm"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" className="px-6 font-bold text-red-700 hover:bg-red-100" onClick={() => setShowRejectInput(false)}>ยกเลิก</Button>
            <Button variant="destructive" className="px-10 font-bold h-11 shadow-lg shadow-red-200" onClick={handleReject} disabled={isSubmitting || !rejectReason.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ยืนยันปฏิเสธคำร้อง
            </Button>
          </div>
        </div>
      )}

      {!showRejectInput && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              ดำเนินการจัดการคำร้อง
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              ตรวจสอบบทบาทและทีมที่เลือกไว้ด้านบนให้ถูกต้องก่อนกดยืนยันการอนุมัติ
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 min-w-[320px]">
            <Button
              variant="outline"
              className="flex-1 md:flex-none md:min-w-[140px] h-12 border-2 text-destructive border-destructive/20 hover:bg-destructive/25 hover:text-destructive-foreground transition-all duration-300 font-bold"
              onClick={() => setShowRejectInput(true)}
              disabled={isSubmitting}
            >
              <XCircle className="h-5 w-5 mr-2" />
              ปฏิเสธ
            </Button>
            <Button
              className="flex-1 md:flex-none md:min-w-[180px] h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all duration-300 font-bold text-base"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              )}
              ยืนยันการอนุมัติคำร้อง
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
