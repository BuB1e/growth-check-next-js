"use client";

import { RequestTable } from "@/components/features/admin/RequestTable";

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">คำร้องขอ</h2>
        <p className="text-sm text-gray-500">
          อนุมัติหรือปฏิเสธคำร้องขอจากผู้ใช้
        </p>
      </div>
      <RequestTable />
    </div>
  );
}
