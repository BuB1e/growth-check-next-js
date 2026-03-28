"use client";

import { ChildDataResponse, DevelopmentResponse } from "@/dto";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { formatAgeMonthsThai, formatBE } from "@/lib/date-utils";
import { DevelopmentStatusToThai, DevelopmentStatus } from "@/types/Enums";

function normalizeRawStatus(status: unknown): string {
  if (typeof status !== "string") {
    return "";
  }
  return DevelopmentStatusToThai[status as DevelopmentStatus] || status.trim();
}

export function DevelopmentCard({
  data,
  index,
  developments = [],
}: {
  data: ChildDataResponse;
  index: number;
  developments?: DevelopmentResponse[];
}) {
  // BMI Calculation: kg / (m^2)
  const bmiValue = data.height > 0 ? data.weight / Math.pow(data.height / 100, 2) : 0;

  // Resolve data from the developments array (since nested objects are removed from DTO)
  const wDev = developments.find((d) => d.id === data.weightDevelopmentId);
  const hDev = developments.find((d) => d.id === data.heightDevelopmentId);

  const weightStatusText = normalizeRawStatus(wDev?.status) || "-";
  const heightStatusText = normalizeRawStatus(hDev?.status) || "-";
  // BMI status is no longer linked in the simplified DTO
  const bmiStatusText = "-";

  const wMetric = wDev?.metric;
  const hMetric = hDev?.metric;
  const bMetric = "BMI";
  const wSuggestion = wDev?.suggestion;
  const hSuggestion = hDev?.suggestion;
  const bSuggestion = undefined;

  const isHealthy = (s: string) => {
    const n = s.toLowerCase();
    if (n === "-" || !n) return true;
    return n.includes("normal") || n.includes("สมส่วน") || n.includes("ปกติ") || n.includes("ตามเกณฑ์");
  };

  const isWarning =
    !isHealthy(weightStatusText) ||
    !isHealthy(heightStatusText);

  const headerBg = isWarning ? "bg-yellow-400" : "bg-[#a7f3d0]"; // yellow or pale green
  const StatusIcon = isWarning ? AlertTriangle : CheckCircle2;

  // Format Date (Thai BE format)
  const dateFormatted = formatBE(data.heightDate, "d MMMM yyyy");
  const rawDateStr = formatBE(data.heightDate, "dd/MM/yyyy");

  const title = `วัดครั้งที่ ${index}`;

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
      <div className="p-4 sm:p-5 grid grid-cols-2 gap-y-6 gap-x-6">
        {/* Row 0: Date & Age */}
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">วันที่วัดผล</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{dateFormatted}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">อายุขณะวัด</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatAgeMonthsThai(
                typeof data.age === "number"
                  ? data.age
                  : (data.age.year || 0) * 12 + (data.age.month || 0)
              )}
            </span>
          </div>
        </div>

        {/* Row 1: Weight & WA Status */}
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">น้ำหนัก (Weight)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {data.weight.toFixed(1)}
            </span>
            <span className="text-[13px] sm:text-[15px] text-gray-500 font-medium">กก.</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">น้ำหนักตามเกณฑ์ (WA)</p>
          <p className={`text-base sm:text-lg font-bold tracking-tight ${!isHealthy(weightStatusText) ? "text-rose-500" : "text-emerald-500"}`}>
            {weightStatusText}
          </p>
        </div>

        {/* Row 2: Height & HA Status */}
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">ส่วนสูง (Height)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {data.height.toFixed(1)}
            </span>
            <span className="text-[13px] sm:text-[15px] text-gray-500 font-medium">ซ.ม.</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">ส่วนสูงตามเกณฑ์ (HA)</p>
          <p className={`text-base sm:text-lg font-bold tracking-tight ${!isHealthy(heightStatusText) ? "text-rose-500" : "text-emerald-500"}`}>
            {heightStatusText}
          </p>
        </div>

        {/* Row 3: BMI & Status */}
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">ดัชนีมวลกาย (BMI)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {bmiValue.toFixed(2)}
            </span>
            <span className="text-[13px] sm:text-[15px] text-gray-500 font-medium italic">kg/m²</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-gray-400">รูปร่าง (BMI Status)</p>
          <p className="text-base sm:text-lg font-bold text-gray-300">
            {bmiStatusText}
          </p>
        </div>

        {/* Suggestions */}
        {(wSuggestion || hSuggestion || bSuggestion) && (
          <div className="col-span-2 mt-2 rounded-xl bg-blue-50/50 border border-blue-100/50 p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wider">
              คำแนะนำ (Suggestions)
            </p>
            <div className="space-y-2">
              {wSuggestion && (
                <p className="text-sm text-gray-700 leading-snug">
                  <span className="font-medium text-blue-700 mr-1">
                    น้ำหนักตามเกณฑ์ (WA):
                  </span>
                  {wSuggestion}
                </p>
              )}
              {hSuggestion && (
                <p className="text-sm text-gray-700 leading-snug">
                  <span className="font-medium text-blue-700 mr-1">
                    ส่วนสูงตามเกณฑ์ (HA):
                  </span>
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
