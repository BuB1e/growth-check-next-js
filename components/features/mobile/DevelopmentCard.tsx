"use client";

import { ChildDataResponse } from "@/dto";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { formatBE } from "@/lib/date-utils";

const DEFAULT_STATUS_THEME = {
  themeColor: "bg-gray-50 text-gray-700 border-gray-200",
  headerBg: "bg-gray-200",
  icon: AlertCircle,
};

function normalizeRawStatus(status: unknown): string {
  if (typeof status !== "string") {
    return "";
  }
  return status.trim();
}

function getThemeByRawStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("normal") || normalized.includes("สมส่วน")) {
    return {
      themeColor: "bg-green-100/50 text-emerald-700 border-green-200",
      headerBg: "bg-green-300",
      icon: CheckCircle2,
    };
  }

  if (
    normalized.includes("under") ||
    normalized.includes("stunted") ||
    normalized.includes("ต่ำกว่า") ||
    normalized.includes("เตี้ย") ||
    normalized.includes("risk")
  ) {
    return {
      themeColor: "bg-amber-50 text-amber-700 border-amber-200",
      headerBg: "bg-amber-400",
      icon: AlertTriangle,
    };
  }

  if (normalized.includes("over") || normalized.includes("มากกว่า")) {
    return {
      themeColor: "bg-amber-50 text-amber-700 border-amber-200",
      headerBg: "bg-amber-400",
      icon: AlertTriangle,
    };
  }

  if (
    normalized === "in_area" ||
    normalized === "out_area" ||
    normalized === "unknown" ||
    normalized === "died"
  ) {
    return {
      themeColor: "bg-red-50 text-red-700 border-red-200",
      headerBg: "bg-red-400",
      icon: AlertCircle,
    };
  }

  return DEFAULT_STATUS_THEME;
}

export function DevelopmentCard({ data }: { data: ChildDataResponse }) {
  const weightStatusText = normalizeRawStatus(data.weightDevelopment?.status) || "-";
  const heightStatusText = normalizeRawStatus(data.heightDevelopment?.status) || "-";
  const fallbackStatusText = normalizeRawStatus(data.status) || "-";

  const mainStatusText =
    weightStatusText !== "-"
      ? weightStatusText
      : heightStatusText !== "-"
        ? heightStatusText
        : fallbackStatusText;

  const statusTheme = getThemeByRawStatus(mainStatusText);

  const themeColor = statusTheme.themeColor;
  const headerBg = statusTheme.headerBg;
  const StatusIcon = statusTheme.icon;
  const statusText = mainStatusText;

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
          {dateFormatted}
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

        <div className="col-span-2 space-y-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            สถานะน้ำหนัก: <span className="font-semibold">{weightStatusText}</span>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            สถานะส่วนสูง: <span className="font-semibold">{heightStatusText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
