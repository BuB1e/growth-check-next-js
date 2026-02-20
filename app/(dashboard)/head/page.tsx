"use client";

import { StatsOverview } from "@/components/features/head/StatsOverview";

export default function HeadDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ภาพรวมพื้นที่</h2>
        <p className="text-sm text-gray-500">
          สถิติและข้อมูลสรุปของพื้นที่รับผิดชอบ
        </p>
      </div>
      <StatsOverview />
    </div>
  );
}
