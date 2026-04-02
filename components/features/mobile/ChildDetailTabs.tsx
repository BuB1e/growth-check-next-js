"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AiPredictionResponse,
  ChildResponse,
  ChildDataResponse,
  DevelopmentResponse,
} from "@/dto";
import {
  Child_status,
  Child_statusToThai,
  SexToThai,
} from "@/types";
import { DevelopmentStatusToThai, DevelopmentStatus } from "@/types/Enums";
import { DevelopmentCard } from "./DevelopmentCard";
import { DevelopmentChart } from "./DevelopmentChart"; // <-- Added Chart Import
import {
  User,
  Activity,
  MapPin,
  List,
  LineChart as LineChartIcon,
  Weight,
  Ruler,
  Sparkles,
  Loader2,
} from "lucide-react";
import { formatAgeThai, formatBE } from "@/lib/date-utils";
import { getPredictionSummaryValue } from "@/lib/prediction-utils";
import { toast } from "sonner";

function getChildStatusKey(status: unknown): Child_status | null {
  if (typeof status !== "string") return null;
  const normalized = status.toUpperCase();
  return (Object.values(Child_status) as string[]).includes(normalized)
    ? (normalized as Child_status)
    : null;
}

function toThaiDevelopmentStatus(status?: string | null): string {
  if (!status) return "-";
  return DevelopmentStatusToThai[status as DevelopmentStatus] || status.trim();
}

export function ChildDetailTabs({
  child,
  history,
  latestPrediction,
  developments,
  userId,
}: {
  child: ChildResponse;
  history: ChildDataResponse[];
  latestPrediction: AiPredictionResponse | null;
  developments: DevelopmentResponse[];
  userId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"personal" | "development">(
    "development",
  );
  const [developmentView, setDevelopmentView] = useState<"list" | "chart">(
    "chart",
  ); // <-- Added View State
  const [isManualPredicting, setIsManualPredicting] = useState(false);
  const [manualPredictMessage, setManualPredictMessage] = useState<string | null>(null);
  const [manualPredictError, setManualPredictError] = useState<string | null>(null);

  const childStatusKey = getChildStatusKey(child.status);
  const childStatusText = childStatusKey
    ? Child_statusToThai[childStatusKey]
    : "ไม่ทราบสถานะ";
  const sexText = SexToThai[child.sex] ?? "ไม่ระบุ";
  const ageText = formatAgeThai(child.birthDate);
  const latestRecord = history[0];
  const latestWeightStatus = toThaiDevelopmentStatus(
    developments.find((d) => d.id === latestRecord?.weightDevelopmentId)?.status,
  );
  const latestHeightStatus = toThaiDevelopmentStatus(
    developments.find((d) => d.id === latestRecord?.heightDevelopmentId)?.status,
  );
  const latestWeightValue =
    typeof latestRecord?.weight === "number" ? `${latestRecord.weight.toFixed(1)} กก.` : "-";
  const latestHeightValue =
    typeof latestRecord?.height === "number" ? `${latestRecord.height.toFixed(1)} ซม.` : "-";
  const latestRecordedDate = latestRecord
    ? formatBE(latestRecord.heightDate, "d MMM yyyy")
    : "-";
  const predictedHeight = latestPrediction
    ? getPredictionSummaryValue(latestPrediction.height)
    : null;
  const predictedWeight = latestPrediction
    ? getPredictionSummaryValue(latestPrediction.weight)
    : null;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

  const pollPredictionUntilReady = async (input: {
    childId: number;
    queuedAt: number;
    baselineIds: number[];
    baselineSignatures?: Record<string, string>;
    initialDelayMs?: number;
    timeoutMs?: number;
  }) => {
    const { pollPredictionForChildAction } = await import(
      "@/app/mobile/staff/child/[child_id]/actions"
    );

    const startedAt = Date.now();
    const timeoutMs = Math.max(1000, Number(input.timeoutMs) || 90_000);
    let delayMs = Math.max(500, Number(input.initialDelayMs) || 2_500);

    while (Date.now() - startedAt < timeoutMs) {
      const result = await pollPredictionForChildAction({
        childId: input.childId,
        queuedAt: input.queuedAt,
        baselineIds: input.baselineIds,
        baselineSignatures: input.baselineSignatures,
        previousDelayMs: delayMs,
      });

      if (!result.success) {
        return {
          success: false as const,
          error: result.error ?? "ไม่สามารถตรวจสอบสถานะการทำนายได้",
        };
      }

      if (result.status === "ready") {
        return { success: true as const };
      }

      delayMs = Math.max(500, Number(result.poll?.nextDelayMs) || delayMs);
      await sleep(delayMs);
    }

    return {
      success: false as const,
      error: "ยังไม่ได้รับผลทำนายในเวลาที่กำหนด",
    };
  };

  const runPredictionWithPolling = async (targetChildId: number) => {
    const { createPredictionForChildAction } = await import(
      "@/app/mobile/staff/child/[child_id]/actions"
    );

    const result = await createPredictionForChildAction(targetChildId, "lstm");

    if (!result.success) {
      return {
        success: false as const,
        error: result.error ?? "ทำนายไม่สำเร็จ กรุณาลองใหม่",
      };
    }

    if (result.status === "ready") {
      return { success: true as const };
    }

    if (result.status !== "polling" || !result.data) {
      return {
        success: false as const,
        error: "รูปแบบผลลัพธ์การทำนายไม่ถูกต้อง",
      };
    }

    const pollData = result.data as {
      queuedAt: number;
      baselineIds: number[];
      baselineSignatures?: Record<string, string>;
      poll?: {
        initialMs?: number;
        timeoutMs?: number;
      };
    };

    return pollPredictionUntilReady({
      childId: targetChildId,
      queuedAt: Number(pollData.queuedAt) || Date.now(),
      baselineIds: Array.isArray(pollData.baselineIds) ? pollData.baselineIds : [],
      baselineSignatures: pollData.baselineSignatures,
      initialDelayMs: pollData.poll?.initialMs,
      timeoutMs: pollData.poll?.timeoutMs,
    });
  };

  const handleManualPrediction = async () => {
    setIsManualPredicting(true);
    setManualPredictMessage(null);
    setManualPredictError(null);

    try {
      const result = await runPredictionWithPolling(child.id);
      if (!result.success) {
        const message = result.error ?? "ทำนายไม่สำเร็จ กรุณาลองใหม่";
        setManualPredictError(message);
        toast.error(message);
        return;
      }

      setManualPredictMessage("ผลทำนายพร้อมใช้งานแล้ว");
      toast.success("ผลทำนายพร้อมใช้งานแล้ว");
      router.refresh();
    } catch {
      setManualPredictError("ไม่สามารถทำนายได้ กรุณาลองใหม่อีกครั้ง");
      toast.error("ไม่สามารถทำนายได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsManualPredicting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Sticky Tabs Header */}
      <div className="sticky top-20 z-40 flex border-b border-gray-100 bg-white/80 px-2 pb-0 pt-2 backdrop-blur-md">

        {/* Development Tab */}
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
            <div className="absolute bottom-0 left-0 right-0 h-0.75 rounded-t-full bg-orange-600" />
          )}
        </button>

        {/* Personal data Tab */}
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
            <div className="absolute bottom-0 left-0 right-0 h-0.75 rounded-t-full bg-blue-600" />
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
                  {child.firstName
                    .replace("ด.ช.", "")
                    .replace("ด.ญ.", "")
                    .trim()
                    .substring(0, 1)}
                </div>
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {child.firstName} {child.lastName}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    สถานะเด็ก: {childStatusText}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    อายุ: {ageText}
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-5">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                    วัน/เดือน/ปีเกิด
                  </p>
                  <p className="text-[17px] font-medium text-gray-800">
                    {formatBE(child.birthDate, "d MMMM yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                    เพศ
                  </p>
                  <p className="text-[17px] font-medium text-gray-800">{sexText}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                    อายุ
                  </p>
                  <p className="text-[17px] font-medium text-gray-800">{ageText}</p>
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
                        เขต {child.locationId}
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
            <div className="rounded-2xl border border-sky-100 bg-linear-to-r from-sky-50 to-white p-3">
              <button
                type="button"
                onClick={handleManualPrediction}
                disabled={isManualPredicting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
              >
                {isManualPredicting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                ทำนายผล 6 เดือน
              </button>

              {manualPredictMessage && (
                <p className="mt-2 text-xs font-medium text-sky-700">{manualPredictMessage}</p>
              )}
              {manualPredictError && (
                <p className="mt-2 text-xs font-medium text-amber-700">{manualPredictError}</p>
              )}
            </div>

            {/* View Toggle Header */}
            {history.length > 0 && (
              <div className="mb-2 space-y-3">
                {latestPrediction && (
                  <div className="rounded-3xl border border-sky-100 bg-linear-to-br from-blue-50 via-sky-50 to-white p-4 shadow-sm ring-1 ring-sky-100/60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[16px] font-bold text-slate-800 tracking-tight">
                          การเจริญเติบโตที่คาดการณ์ในอีก 6 เดือนข้างหน้า
                        </h3>
                      </div>
                      <span className="inline-flex rounded-full border border-sky-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        AI
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400">ส่วนสูงที่ทำนาย</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {predictedHeight !== null ? `${predictedHeight.toFixed(1)} ซม.` : "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400">น้ำหนักที่ทำนาย</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {predictedWeight !== null ? `${predictedWeight.toFixed(1)} กก.` : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <LatestRecord
                  latestRecordedDate={latestRecordedDate}
                  latestWeightValue={latestWeightValue}
                  latestWeightStatus={latestWeightStatus}
                  latestHeightValue={latestHeightValue}
                  latestHeightStatus={latestHeightStatus}
                />

                {/* Total Measurement Count Card */}
                <TotalMeasurementCard count={history.length} />

                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-bold text-gray-800 tracking-tight">
                    {developmentView === "list"
                      ? "ประวัติการวัด"
                      : "ภาพรวมพัฒนาการ"}
                  </p>
                  <div className="flex bg-gray-100/80 p-1 rounded-xl">
                  <button
                    onClick={() => setDevelopmentView("list")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      developmentView === "list"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" strokeWidth={2.5} />
                    รายการ
                  </button>
                  <button
                    onClick={() => setDevelopmentView("chart")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      developmentView === "chart"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <LineChartIcon className="w-4 h-4" strokeWidth={2.5} />
                    กราฟ
                  </button>
                </div>
                </div>
              </div>
            )}

            {history.length > 0 ? (
              developmentView === "list" ? (
                // List View
                <div className="space-y-4">
                  {
                    history.sort((a, b) => b.id - a.id).map((record, i) => (
                      <DevelopmentCard
                        key={record.id}
                        data={record}
                        index={history.length - i}
                        developments={developments}
                      />
                    ))
                  }
                </div>
              ) : (
                // Chart View
                <DevelopmentChart history={history} developments={developments} prediction={latestPrediction} />
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
                <p className="mx-auto max-w-62.5 text-sm text-gray-500">
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

function LatestRecord({latestRecordedDate, latestWeightValue, latestWeightStatus, latestHeightValue, latestHeightStatus}: {latestRecordedDate: string, latestWeightValue: string, latestWeightStatus: string, latestHeightValue: string, latestHeightStatus: string}) {
  return(
    <div className="rounded-3xl border border-sky-100 bg-linear-to-br from-sky-50 via-cyan-50 to-white p-4 shadow-sm ring-1 ring-sky-100/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[16px] font-bold text-slate-800 tracking-tight">
                        ข้อมูลล่าสุด
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        บันทึกล่าสุดวันที่ {latestRecordedDate}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-sky-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-sky-700">
                      ล่าสุด
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">น้ำหนัก</p>
                      <p className="mt-1 flex items-center gap-1 text-[20px] font-extrabold text-slate-900">
                        <Weight className="h-4 w-4 text-emerald-600" />
                        {latestWeightValue}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        สถานะ: {latestWeightStatus}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">ส่วนสูง</p>
                      <p className="mt-1 flex items-center gap-1 text-[20px] font-extrabold text-slate-900">
                        <Ruler className="h-4 w-4 text-blue-600" />
                        {latestHeightValue}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        สถานะ: {latestHeightStatus}
                      </p>
                    </div>
                  </div>
                </div>
  );
}

function TotalMeasurementCard({ count }: { count: number }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/60 ring-1 ring-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2.5 rounded-2xl text-orange-600 shadow-sm border border-orange-100">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    จำนวนครั้งที่วัดทั้งหมด
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    ประวัติการเจริญเติบโตในระบบ
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-orange-600">
                  {count}
                </span>
                <span className="ml-1 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  ครั้ง
                </span>
              </div>
            </div>
  );
}
