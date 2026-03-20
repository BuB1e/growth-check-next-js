"use client";

import { ChildDataResponse, DevelopmentResponse } from "@/dto";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { formatBE } from "@/lib/date-utils";

function normalizeRawStatus(status: unknown): string {
  if (typeof status !== "string") {
    return "";
  }
  return status.trim();
}

export function DevelopmentCard({
  data,
  developments = [],
}: {
  data: ChildDataResponse;
  developments?: DevelopmentResponse[];
}) {
  // Resolve data from joined objects if available, otherwise find in developments array
  const wDev =
    data.weightDevelopment ||
    developments.find((d) => d.id === data.weightDevelopmentId);
  const hDev =
    data.heightDevelopment ||
    developments.find((d) => d.id === data.heightDevelopmentId);

  const weightStatusText = normalizeRawStatus(wDev?.status) || "-";
  const heightStatusText = normalizeRawStatus(hDev?.status) || "-";

  const wMetric = wDev?.metric;
  const hMetric = hDev?.metric;
  const wSuggestion = wDev?.suggestion;
  const hSuggestion = hDev?.suggestion;

  const isHealthy = (s: string) => {
    const n = s.toLowerCase();
    return n.includes("normal") || n.includes("สมส่วน") || n.includes("ปกติ") || n.includes("ตามเกณฑ์");
  };

  const isWarning = !isHealthy(weightStatusText) || !isHealthy(heightStatusText);

  const headerBg = isWarning ? "bg-yellow-400" : "bg-[#a7f3d0]"; // yellow or pale green
  const StatusIcon = isWarning ? AlertTriangle : CheckCircle2;

  // Format Date (Thai BE format)
  const dateFormatted = formatBE(data.heightDate, "d MMMM yyyy");
  const rawDateStr = formatBE(data.heightDate, "dd/MM/yyyy");

  // In the real app, we might need a "ครั้งที่" prefix. Since it's not provided in data directly, 
  // we just use the date.
  const title = `การวัดผล (${dateFormatted})`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
      {/* Header bar */}
      <div
        className={`px-4 py-3 flex items-center justify-between ${headerBg}`}
      >
        <h3 className="text-gray-900 font-bold text-base sm:text-lg tracking-tight">
          {title}
        </h3>
        <StatusIcon
          className="h-7 w-7 text-gray-900 drop-shadow-sm"
          strokeWidth={2.5}
        />
      </div>

      {/* Grid Content */}
      <div className="p-4 sm:p-5 grid grid-cols-2 gap-y-6 gap-x-4">
        {/* Weight Section */}
        <div className="space-y-1 relative">
          <p className="text-[13px] font-medium text-gray-400">น้ำหนัก (Weight)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-semibold text-gray-900">
              {data.weight.toFixed(1)}
            </span>
            <span className="text-[13px] sm:text-[15px] text-gray-600 font-medium">
              กก. (Kg.)
            </span>
          </div>
        </div>

        {/* Height Section */}
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-gray-400">ส่วนสูง (Height)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-semibold text-gray-900">
              {data.height.toFixed(1)}
            </span>
            <span className="text-[13px] sm:text-[15px] text-gray-600 font-medium">
              ซ.ม. (cm.)
            </span>
          </div>
        </div>

        {/* Weight Status */}
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-gray-400 truncate">
            สถานะน้ำหนัก {wMetric ? `(${wMetric})` : ""}
          </p>
          <p className={`text-base sm:text-lg font-medium tracking-tight ${!isHealthy(weightStatusText) ? "text-red-500" : "text-emerald-500"}`}>
            {weightStatusText}
          </p>
        </div>

        {/* Height Status */}
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-gray-400 truncate">
            สถานะส่วนสูง {hMetric ? `(${hMetric})` : ""}
          </p>
          <p className={`text-base sm:text-lg font-medium tracking-tight ${!isHealthy(heightStatusText) ? "text-red-500" : "text-emerald-500"}`}>
            {heightStatusText}
          </p>
        </div>

        {/* Date Bottom */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <p className="text-[13px] font-medium text-gray-400">วันที่ (Date)</p>
          <p className="text-base sm:text-lg font-medium text-gray-800 tracking-tight">
            {rawDateStr}
          </p>
        </div>

        {/* Suggestions */}
        {(wSuggestion || hSuggestion) && (
          <div className="col-span-2 mt-2 rounded-xl bg-blue-50/50 border border-blue-100/50 p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2">คำแนะนำ (Suggestion)</p>
            <div className="space-y-2">
              {wSuggestion && (
                <p className="text-sm text-gray-700 leading-snug">
                  <span className="font-medium text-blue-700 mr-1">{wMetric ? `${wMetric}:` : "น้ำหนัก:"}</span> 
                  {wSuggestion}
                </p>
              )}
              {hSuggestion && (
                <p className="text-sm text-gray-700 leading-snug">
                  <span className="font-medium text-blue-700 mr-1">{hMetric ? `${hMetric}:` : "ส่วนสูง:"}</span> 
                  {hSuggestion}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
