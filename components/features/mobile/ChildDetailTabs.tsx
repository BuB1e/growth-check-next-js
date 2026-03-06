"use client";

import { useState } from "react";
import { ChildResponse, ChildDataResponse } from "@/dto";
import { DevelopmentCard } from "./DevelopmentCard";
import { DevelopmentChart } from "./DevelopmentChart"; // <-- Added Chart Import
import {
  User,
  Activity,
  MapPin,
  List,
  LineChart as LineChartIcon,
} from "lucide-react";
import { formatBE } from "@/lib/date-utils";

export function ChildDetailTabs({
  child,
  history,
}: {
  child: ChildResponse;
  history: ChildDataResponse[];
}) {
  const [activeTab, setActiveTab] = useState<"personal" | "development">(
    "personal",
  );
  const [developmentView, setDevelopmentView] = useState<"list" | "chart">(
    "list",
  ); // <-- Added View State

  return (
    <div className="w-full">
      {/* Sticky Tabs Header */}
      <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 flex pb-0 pt-2 px-2">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 pb-3 text-[15px] font-semibold transition-all relative ${
            activeTab === "personal"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <User className="w-4 h-4" />
            ข้อมูลส่วนบุคคล
          </div>
          {activeTab === "personal" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("development")}
          className={`flex-1 pb-3 text-[15px] font-semibold transition-all relative ${
            activeTab === "development"
              ? "text-orange-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            พัฒนาการ
          </div>
          {activeTab === "development" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="p-4 pt-6 pb-24">
        {activeTab === "personal" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Personal Details Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/60 ring-1 ring-black/5">
              <div className="flex items-start gap-4 pb-6 border-b border-gray-50/80">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-inner">
                  {child.first_name
                    .replace("ด.ช.", "")
                    .replace("ด.ญ.", "")
                    .trim()
                    .substring(0, 1)}
                </div>
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {child.first_name} {child.last_name}
                  </h2>
                  <p className="text-gray-500 font-medium text-sm mt-0.5">
                    {child.gender === "male" ? "ชาย" : "หญิง"}
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-5">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                    วัน/เดือน/ปีเกิด
                  </p>
                  <p className="text-[17px] font-medium text-gray-800">
                    {formatBE(child.birth_date, "d MMMM yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                    สถานะ
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      child.status === "In_Area"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {child.status === "In_Area"
                      ? "อยู่ในพื้นที่"
                      : child.status}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-center">
                    <div className="bg-white p-2 rounded-xl text-gray-400 shadow-sm border border-gray-100">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        ศูนย์พัฒนาเด็กเล็ก
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium mt-0.5">
                        เขต {child.location_id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "development" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* View Toggle Header */}
            {history.length > 0 && (
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-[15px] font-bold text-gray-800 tracking-tight">
                  {developmentView === "list"
                    ? "ประวัติการวัด"
                    : "ภาพรวมพัฒนาการ"}
                </h3>
                <div className="flex bg-gray-100/80 p-1 rounded-xl">
                  <button
                    onClick={() => setDevelopmentView("list")}
                    className={`p-1.5 rounded-lg transition-all ${
                      developmentView === "list"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setDevelopmentView("chart")}
                    className={`p-1.5 rounded-lg transition-all ${
                      developmentView === "chart"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <LineChartIcon className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {history.length > 0 ? (
              developmentView === "list" ? (
                // List View
                <div className="space-y-4">
                  {history.map((record) => (
                    <DevelopmentCard key={record.id} data={record} />
                  ))}
                </div>
              ) : (
                // Chart View
                <DevelopmentChart history={history} />
              )
            ) : (
              // Empty State
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-gray-100 border-dashed mt-8">
                <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-400">
                  <Activity className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  ยังไม่มีประวัติการวัด
                </h3>
                <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
                  เด็กคนนี้ยังไม่มีข้อมูลการเจริญเติบโตที่ถูกบันทึกในระบบ
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
