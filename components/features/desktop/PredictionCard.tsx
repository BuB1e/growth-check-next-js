"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBE } from "@/lib/date-utils";
import { getPredictionSummaryValue } from "@/lib/prediction-utils";
import type { AiPredictionResponse } from "@/dto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PredictionModel } from "@/app/desktop/children/actions";
import { DevelopmentStatusToThai, DevelopmentStatus } from "@/types/Enums";

interface PredictionCardProps {
  childId: number;
  latestPrediction: AiPredictionResponse | null;
}

type PredictionUiState =
  | "idle"
  | "submitting"
  | "queued"
  | "polling"
  | "success"
  | "timeout"
  | "error";

type PollingPolicy = {
  initialMs: number;
  backoffFactor: number;
  maxMs: number;
  timeoutMs: number;
  hiddenMinMs: number;
  jitterRatio: number;
};

type PendingPredictionRequest = {
  childId: number;
  queuedAt: number;
  baselineIds: number[];
  baselineSignatures?: Record<string, string>;
  poll: PollingPolicy;
  createdAt: number;
};

const PENDING_PREDICTION_KEY_PREFIX = "prediction-pending:";

const toSafeIsoString = (value: unknown): string => {
  const date = new Date(value as string | number | Date);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
};

const buildPredictionSignature = (item: AiPredictionResponse): string => {
  return JSON.stringify({
    id: item.id,
    modelUsed: item.modelUsed,
    modelVersion: item.modelVersion,
    month: item.month,
    dateTime: toSafeIsoString(item.dateTime),
    createdAt: toSafeIsoString(item.createdAt),
    height: item.height,
    weight: item.weight,
  });
};

const toValidPolicyNumber = (value: unknown, min?: number): number | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  if (typeof min === "number" && parsed < min) return null;
  return parsed;
};

export function PredictionCard({
  childId,
  latestPrediction,
}: PredictionCardProps) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const [uiState, setUiState] = useState<PredictionUiState>("idle");
  const [selectedModel, setSelectedModel] = useState<PredictionModel>("lstm");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const pollingPolicyRef = useRef<PollingPolicy | null>(null);
  const [resolvedPrediction, setResolvedPrediction] =
    useState<AiPredictionResponse | null>(latestPrediction);
  const pendingRequestRef = useRef<{
    baselinePredictionId: number | null;
    baselinePredictionSignature: string | null;
    queuedAt: number;
  } | null>(null);
  const pollInFlightRef = useRef(false);

  const getPendingStorageKey = useCallback(() => {
    return `${PENDING_PREDICTION_KEY_PREFIX}${childId}`;
  }, [childId]);

  const clearPendingFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(getPendingStorageKey());
  }, [getPendingStorageKey]);

  const savePendingToStorage = useCallback((value: PendingPredictionRequest) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(getPendingStorageKey(), JSON.stringify(value));
  }, [getPendingStorageKey]);

  const loadPendingFromStorage = useCallback((): PendingPredictionRequest | null => {
    if (typeof window === "undefined") return null;

    const raw = window.sessionStorage.getItem(getPendingStorageKey());
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as PendingPredictionRequest;

      if (parsed.childId !== childId) {
        return null;
      }

      // Expire stale requests after 10 minutes.
      if (Date.now() - parsed.createdAt > 10 * 60 * 1000) {
        window.sessionStorage.removeItem(getPendingStorageKey());
        return null;
      }

      return parsed;
    } catch {
      window.sessionStorage.removeItem(getPendingStorageKey());
      return null;
    }
  }, [childId, getPendingStorageKey]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setResolvedPrediction(latestPrediction);
  }, [latestPrediction]);

  useEffect(() => {
    const pending = loadPendingFromStorage();
    if (!pending || pollInFlightRef.current) return;

    pollingPolicyRef.current = pending.poll;
    pendingRequestRef.current = {
      baselinePredictionId: resolvedPrediction?.id ?? null,
      baselinePredictionSignature: resolvedPrediction
        ? buildPredictionSignature(resolvedPrediction)
        : null,
      queuedAt: pending.queuedAt,
    };
    setUiState("queued");

    void pollPredictionUntilReady({
      queuedAt: pending.queuedAt,
      baselineIds: pending.baselineIds,
      baselineSignatures: pending.baselineSignatures,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, loadPendingFromStorage, resolvedPrediction]);

  useEffect(() => {
    const pending = pendingRequestRef.current;
    if (!pending) return;

    const waitingState =
      uiState === "submitting" || uiState === "queued" || uiState === "polling";
    if (!waitingState || !resolvedPrediction) return;

    const hasNewPrediction =
      pending.baselinePredictionId === null ||
      resolvedPrediction.id !== pending.baselinePredictionId;

    const resolvedSignature = buildPredictionSignature(resolvedPrediction);
    const hasSignatureChanged =
      pending.baselinePredictionSignature !== null &&
      resolvedSignature !== pending.baselinePredictionSignature;

    const resolvedCreatedAt = new Date(resolvedPrediction.createdAt).getTime();
    const isCreatedAfterQueue =
      Number.isFinite(resolvedCreatedAt) && resolvedCreatedAt >= pending.queuedAt - 5_000;

    if (!hasNewPrediction && !hasSignatureChanged && !isCreatedAfterQueue) return;

    setUiState("success");
    setSuccessMessage("ผลทำนายพร้อมใช้งานแล้ว");
    pendingRequestRef.current = null;
  }, [resolvedPrediction, uiState]);

  const predictedHeight = resolvedPrediction
    ? getPredictionSummaryValue(resolvedPrediction.height)
    : null;
  const predictedWeight = resolvedPrediction
    ? getPredictionSummaryValue(resolvedPrediction.weight)
    : null;

  const sleep = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const getPolicy = (): PollingPolicy | null => {
    return pollingPolicyRef.current;
  };

  const withJitter = (ms: number): number => {
    const policy = getPolicy();
    if (!policy) return ms;

    const jitterFactor = Math.min(policy.jitterRatio, 0.9);
    const delta = ms * jitterFactor;
    const randomized = ms + (Math.random() * 2 - 1) * delta;
    return Math.max(500, Math.round(randomized));
  };

  const nextDelay = (current: number): number => {
    const policy = getPolicy();
    if (!policy) return current;

    const grown = Math.min(
      policy.maxMs,
      Math.round(current * policy.backoffFactor),
    );
    const hiddenFloor =
      typeof document !== "undefined" && document.visibilityState === "hidden"
        ? policy.hiddenMinMs
        : 0;
    return Math.max(grown, hiddenFloor);
  };

  const pollPredictionUntilReady = async ({
    queuedAt,
    baselineIds,
    baselineSignatures,
  }: {
    queuedAt: number;
    baselineIds: number[];
    baselineSignatures?: Record<string, string>;
  }) => {
    if (pollInFlightRef.current) return;

    const policy = getPolicy();
    if (!policy) {
      setUiState("error");
      setErrorMessage("การตั้งค่า polling ไม่ถูกต้อง กรุณาตรวจสอบ .env");
      return;
    }

    pollInFlightRef.current = true;

    const startedAt = Date.now();
    const timeoutMs = policy.timeoutMs;
    let delayMs = policy.initialMs;

    while (Date.now() - startedAt < timeoutMs) {
      if (!isMountedRef.current) {
        pollInFlightRef.current = false;
        return;
      }

      setUiState("polling");

      const { pollChildPredictionAction } = await import(
        "@/app/desktop/children/actions"
      );

      let result: Awaited<ReturnType<typeof pollChildPredictionAction>>;
      try {
        result = await pollChildPredictionAction({
          childId,
          queuedAt,
          baselineIds,
          baselineSignatures,
          previousDelayMs: delayMs,
        });
      } catch {
        if (isMountedRef.current) {
          setUiState("error");
          setErrorMessage("เรียกตรวจสอบสถานะการทำนายไม่สำเร็จ");
        }
        return;
      }

      if (!result.success) {
        if (isMountedRef.current) {
          setUiState("error");
          setErrorMessage(result.error ?? "ตรวจสอบสถานะการทำนายไม่สำเร็จ");
        }
        pendingRequestRef.current = null;
        clearPendingFromStorage();
        pollInFlightRef.current = false;
        return;
      }

      if (result.status === "ready") {
        if (isMountedRef.current) {
          setResolvedPrediction(result.data);
          setUiState("success");
          setSuccessMessage("ผลทำนายพร้อมใช้งานแล้ว");
        }
        pendingRequestRef.current = null;
        clearPendingFromStorage();
        pollInFlightRef.current = false;
        router.refresh();
        return;
      }

      delayMs = Number(result.poll?.nextDelayMs) || nextDelay(delayMs);

      await sleep(withJitter(delayMs));
    }

    if (isMountedRef.current) {
      setUiState("timeout");
    }
    pendingRequestRef.current = null;
    clearPendingFromStorage();
    pollInFlightRef.current = false;
  };

  const handleRunPrediction = async () => {
    if (uiState === "submitting" || uiState === "queued" || uiState === "polling") {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUiState("submitting");
    pendingRequestRef.current = {
      baselinePredictionId: resolvedPrediction?.id ?? null,
      baselinePredictionSignature: resolvedPrediction
        ? buildPredictionSignature(resolvedPrediction)
        : null,
      queuedAt: Date.now(),
    };

    const { createChildPredictionQueueAction } = await import(
        "@/app/desktop/children/actions"
      );

    const result = await createChildPredictionQueueAction(childId, selectedModel);

    if (!result.success || !result.data) {
      setUiState("error");
      setErrorMessage(result.error ?? "ไม่สามารถส่งคำขอทำนายได้ กรุณาลองใหม่");
      pendingRequestRef.current = null;
      return;
    }

    setUiState("queued");
    pendingRequestRef.current = {
      baselinePredictionId: pendingRequestRef.current?.baselinePredictionId ?? null,
      baselinePredictionSignature:
        pendingRequestRef.current?.baselinePredictionSignature ?? null,
      queuedAt: Number(result.data.queuedAt) || Date.now(),
    };

    const initialMs = toValidPolicyNumber(result.data.poll?.initialMs, 1);
    const backoffFactor = toValidPolicyNumber(result.data.poll?.backoffFactor, 1);
    const maxMs = toValidPolicyNumber(result.data.poll?.maxMs, 1);
    const timeoutMs = toValidPolicyNumber(result.data.poll?.timeoutMs, 1);
    const hiddenMinMs = toValidPolicyNumber(result.data.poll?.hiddenMinMs, 1);
    const jitterRatio = toValidPolicyNumber(result.data.poll?.jitterRatio, 0);

    if (
      initialMs === null ||
      backoffFactor === null ||
      maxMs === null ||
      timeoutMs === null ||
      hiddenMinMs === null ||
      jitterRatio === null
    ) {
      setUiState("error");
      setErrorMessage("การตั้งค่า polling ไม่ถูกต้อง กรุณาตรวจสอบ .env");
      return;
    }

    pollingPolicyRef.current = {
      initialMs,
      backoffFactor,
      maxMs,
      timeoutMs,
      hiddenMinMs,
      jitterRatio,
    };

    savePendingToStorage({
      childId,
      queuedAt: Number(result.data.queuedAt) || Date.now(),
      baselineIds: Array.isArray(result.data.baselineIds) ? result.data.baselineIds : [],
      baselineSignatures: result.data.baselineSignatures,
      poll: pollingPolicyRef.current,
      createdAt: Date.now(),
    });

    await pollPredictionUntilReady(result.data);
  };

  const isBusy = uiState === "submitting" || uiState === "queued" || uiState === "polling";
  const stateMessage =
    uiState === "submitting"
      ? "กำลังส่งคำขอทำนาย..."
      : uiState === "queued"
        ? "ส่งคำขอแล้ว กำลังเข้าคิวประมวลผล"
        : uiState === "polling"
          ? "กำลังรอผลจากระบบ AI"
          : null;

  return (
    <div className="rounded-xl border bg-slate-50/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            AI Prediction (คาดการณ์การเจริญเติบโต)
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            ใช้ข้อมูลย้อนหลังเพื่อคาดการณ์แนวโน้มเดือนถัดไป
          </p>
          <div className="mt-3 w-40">
            <Select
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value as PredictionModel)}
              disabled={isBusy}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="เลือกโมเดล" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lstm">LSTM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleRunPrediction}
          disabled={isBusy}
          className="bg-sky-600 hover:bg-sky-700"
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="ml-2">ทำนายผล 6 เดือน</span>
        </Button>
      </div>

      {stateMessage && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          {stateMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {uiState === "timeout" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p>ยังไม่ได้รับผลทำนายในเวลาที่กำหนด ระบบอาจกำลังประมวลผลอยู่</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 bg-white"
            onClick={() => router.refresh()}
          >
            รีเฟรชผลลัพธ์
          </Button>
        </div>
      )}

      {resolvedPrediction ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs text-slate-500">ส่วนสูงที่คาดการณ์</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {predictedHeight !== null ? `${predictedHeight.toFixed(1)} ซม.` : "-"}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs text-slate-500">น้ำหนักที่คาดการณ์</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {predictedWeight !== null ? `${predictedWeight.toFixed(1)} กก.` : "-"}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-3 md:col-span-2">
              <p className="text-xs text-slate-500">
                โมเดล {resolvedPrediction.modelUsed} v{resolvedPrediction.modelVersion} • ข้อมูลย้อนหลัง {resolvedPrediction.dataMonthsUsed} เดือน
              </p>
              <p className="text-sm text-slate-700 mt-1">
                วันที่ทำนาย {formatBE(resolvedPrediction.dateTime, "d MMM yyyy")}
              </p>
            </div>
          </div>

          {/* TODO: Render development timelines from heightDevelopments/weightDevelopments */}
          {(resolvedPrediction.heightDevelopments?.length ?? 0) > 0 ||
          (resolvedPrediction.weightDevelopments?.length ?? 0) > 0 ? (
            <div className="rounded-lg border bg-white p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600">ประวัติพัฒนาการที่คาดการณ์</p>
              {resolvedPrediction.heightDevelopments &&
                resolvedPrediction.heightDevelopments.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-1">ส่วนสูง (HA)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resolvedPrediction.heightDevelopments.map((dev) => (
                        <span
                          key={dev.id}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                        >
                          {DevelopmentStatusToThai[dev.status as DevelopmentStatus] || dev.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {resolvedPrediction.weightDevelopments &&
                resolvedPrediction.weightDevelopments.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-1">น้ำหนัก (WA)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resolvedPrediction.weightDevelopments.map((dev) => (
                        <span
                          key={dev.id}
                          className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10"
                        >
                          {DevelopmentStatusToThai[dev.status as DevelopmentStatus] || dev.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-white p-3 text-sm text-slate-600">
          ยังไม่มีผลการทำนายสำหรับเด็กคนนี้
        </div>
      )}
    </div>
  );
}
