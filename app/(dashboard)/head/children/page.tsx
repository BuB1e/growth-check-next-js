"use client";

import { ChildList } from "@/components/features/staff/ChildList";

export default function HeadChildrenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ข้อมูลเด็ก</h2>
        <p className="text-sm text-gray-500">
          รายชื่อเด็กในพื้นที่รับผิดชอบ (อ่านอย่างเดียว)
        </p>
      </div>
      <ChildList readOnly />
    </div>
  );
}
