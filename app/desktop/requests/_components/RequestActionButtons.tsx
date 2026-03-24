"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  approveLocationRequestAction, 
  rejectLocationRequestAction,
  approveTransferRequestAction,
  rejectTransferRequestAction
} from "../actions";

interface RequestActionButtonsProps {
  id: number | string;
  type: "location" | "transfer";
  handlerId: string;
}

export function RequestActionButtons({ id, type, handlerId }: RequestActionButtonsProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleAction = async (actionType: "approve" | "reject") => {
    setIsPending(true);
    try {
      let result;
      if (type === "location") {
        const numId = typeof id === "string" ? parseInt(id, 10) : id;
        result = actionType === "approve" 
          ? await approveLocationRequestAction(numId, handlerId)
          : await rejectLocationRequestAction(numId, handlerId);
      } else {
        result = actionType === "approve"
          ? await approveTransferRequestAction(id.toString(), handlerId)
          : await rejectTransferRequestAction(id.toString(), handlerId);
      }

      if (result.success) {
        // Success
        router.refresh();
      } else {
        alert(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={() => handleAction("approve")}
        disabled={isPending}
        className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <CheckCircle2 className="h-4 w-4 mr-2" />
        )}
        อนุมัติ
      </Button>
      <Button
        variant="destructive"
        onClick={() => handleAction("reject")}
        disabled={isPending}
        className="min-w-[120px]"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <XCircle className="h-4 w-4 mr-2" />
        )}
        ปฏิเสธ
      </Button>
    </div>
  );
}
