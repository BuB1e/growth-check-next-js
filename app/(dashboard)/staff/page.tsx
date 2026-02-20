"use client";

import { ChildList } from "@/components/features/staff/ChildList";

export default function StaffHomePage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">รายชื่อเด็ก</h2>
        <p className="text-sm text-gray-500">
          ค้นหาและเพิ่มข้อมูลการเจริญเติบโต
        </p>
      </div>
      <ChildList />
    </div>
  );
}
