"use client";

import { useMobilePageStore } from "@/stores/MobilePageStore";
import { EMobilePageToThai } from "@/types";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopbarMobile() {
  const router = useRouter();
  const selectedTab = useMobilePageStore((state) => state.selectedTab);

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <button
        onClick={() => router.back()}
        className="p-2 -ml-2 rounded-full hover:bg-gray-50 transition-colors active:scale-95"
        aria-label="กลับไปหน้าก่อนหน้า"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
        {EMobilePageToThai[selectedTab] || selectedTab}
      </h1>

      {/* Empty div for flex space alignment */}
      <div className="w-10"></div>
    </div>
  );
}
