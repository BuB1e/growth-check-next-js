"use client";

import { UserTable } from "@/components/features/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h2>
        <p className="text-sm text-gray-500">
          ดูข้อมูลและจัดการบัญชีผู้ใช้ทั้งหมดในระบบ
        </p>
      </div>
      <UserTable />
    </div>
  );
}
