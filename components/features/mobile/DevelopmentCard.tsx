"use client";

import { ChildDataResponse } from "@/dto";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { formatBE } from "@/lib/date-utils";

export function DevelopmentCard({ data }: { data: ChildDataResponse }) {
  // Determine the overall status for conditional styling
  // We prioritize the most severe status between weight and height
  const wStatus = data.weightDevelopment?.status || "ปกติ";
  const hStatus = data.heightDevelopment?.status || "ปกติ";

  const isWarning =
    wStatus.includes("มากกว่าเกณฑ์") || hStatus.includes("มากกว่าเกณฑ์");
  const isDanger =
    wStatus.includes("น้อยกว่าเกณฑ์") ||
    hStatus.includes("น้อยกว่าเกณฑ์") ||
    wStatus.includes("เตี้ย") ||
    wStatus.includes("ผอม");

  // Conditionally assign colors and icons
  let themeColor = "bg-green-100/50 text-emerald-700 border-green-200";
  let statusText = "ปกติ";
  let headerBg = "bg-green-300";
  let StatusIcon = CheckCircle2;

  if (isDanger) {
    themeColor = "bg-red-50 text-red-700 border-red-200";
    statusText = "ต่ำกว่าเกณฑ์";
    headerBg = "bg-red-400";
    StatusIcon = AlertCircle;
  } else if (isWarning) {
    themeColor = "bg-amber-50 text-amber-700 border-amber-200";
    statusText = "มากกว่าเกณฑ์";
    headerBg = "bg-amber-400";
    StatusIcon = AlertTriangle;
  }

  // Format Date (Thai BE format)
  const dateFormatted = formatBE(data.heightDate, "d MMMM yyyy");
  const rawDateStr = formatBE(data.heightDate, "dd-MM-yyyy");

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
      {/* Header bar */}
      <div
        className={`px-4 py-3 flex items-center justify-between ${headerBg}`}
      >
        <h3 className="text-gray-900 font-bold text-lg tracking-tight">
          ครั้งที่ {data.index} ({dateFormatted})
        </h3>
        <StatusIcon
          className="h-6 w-6 text-gray-900 drop-shadow-sm"
          strokeWidth={2.5}
        />
      </div>

      {/* Grid Content */}
      <div className="p-5 grid grid-cols-2 gap-y-6 gap-x-4">
        {/* Weight Section */}
        <div className="space-y-1 relative">
          <p className="text-sm font-medium text-gray-400">น้ำหนัก (Weight)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">
              {data.weight.toFixed(1)}
            </span>
            <span className="text-[15px] text-gray-600 font-medium">
              กก. (Kg.)
            </span>
          </div>
        </div>

        {/* Height Section */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-400">ส่วนสูง (Height)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">
              {data.height.toFixed(1)}
            </span>
            <span className="text-[15px] text-gray-600 font-medium">
              ซ.ม. (cm.)
            </span>
          </div>
        </div>

        {/* Date Bottom Left */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-400">วันที่ (Date)</p>
          <p className="text-lg font-medium text-gray-800 tracking-tight">
            {rawDateStr}
          </p>
        </div>

        {/* Status Bottom Right */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-400">สถานะ (Status)</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${themeColor}`}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
}
