"use client";

import { useState, useMemo } from "react";
import { AiPredictionResponse, ChildDataResponse } from "@/dto";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatBE } from "@/lib/date-utils";
import { buildPredictionPoints } from "@/lib/prediction-utils";

interface DevelopmentChartProps {
  history: ChildDataResponse[];
  prediction?: AiPredictionResponse | null;
}

export function DevelopmentChart({
  history,
  prediction = null,
}: DevelopmentChartProps) {
  const [activeMetric, setActiveMetric] = useState<
    "both" | "height" | "weight"
  >("both");

  const latestHistoricalDate = useMemo(() => {
    const valid = [...history]
      .filter((record) => !Number.isNaN(new Date(record.heightDate).getTime()))
      .sort(
        (a, b) =>
          new Date(a.heightDate).getTime() - new Date(b.heightDate).getTime(),
      );

    const latest = valid[valid.length - 1];
    return latest ? new Date(latest.heightDate) : undefined;
  }, [history]);

  const chartData = useMemo(() => {
    const sortedHistory = [...history]
      .filter((record) => !Number.isNaN(new Date(record.heightDate).getTime()))
      .sort(
        (a, b) =>
          new Date(a.heightDate).getTime() - new Date(b.heightDate).getTime(),
      );

    const historicalData = sortedHistory.map((record) => {
      const shortDate = formatBE(record.heightDate, "d MMM yy");

      return {
        name: `ครั้งที่ ${record.id}`,
        dateOrder: new Date(record.heightDate).getTime(),
        shortDate,
        height: Number(record.height.toFixed(1)),
        weight: Number(record.weight.toFixed(1)),
        predictedHeightTrend: undefined as number | undefined,
        predictedWeightTrend: undefined as number | undefined,
      };
    });

    const predictedData = buildPredictionPoints(prediction, {
      anchorDate: latestHistoricalDate,
    }).map((point, index) => ({
      name: `ทำนาย ${index + 1}`,
      dateOrder: point.predictedDate.getTime(),
      shortDate: formatBE(point.predictedDate, "d MMM yy"),
      height: undefined as number | undefined,
      weight: undefined as number | undefined,
      predictedHeightTrend: point.predictedHeight,
      predictedWeightTrend: point.predictedWeight,
    }));

    if (historicalData.length > 0 && predictedData.length > 0) {
      const lastIndex = historicalData.length - 1;
      const last = historicalData[lastIndex];
      historicalData[lastIndex] = {
        ...last,
        predictedHeightTrend: last.height,
        predictedWeightTrend: last.weight,
      };
    }

    return [...historicalData, ...predictedData]
      .filter((point) => Number.isFinite(point.dateOrder))
      .sort((a, b) => a.dateOrder - b.dateOrder);
  }, [history, latestHistoricalDate, prediction]);

  const formatNumber = (value: number): string =>
    Number.isInteger(value) ? `${value}` : value.toFixed(2);

  const buildTicks = (maxValue: number): number[] => {
    const upper = Math.max(30, Math.ceil(maxValue + 30));
    const step = upper <= 20 ? 1 : upper <= 50 ? 2 : 5;
    const ticks: number[] = [];

    for (let i = 0; i <= upper; i += step) {
      ticks.push(i);
    }

    if (ticks[ticks.length - 1] !== upper) {
      ticks.push(upper);
    }

    return ticks;
  };

  const heightMax = Math.max(
    0,
    ...chartData.flatMap((d) =>
      [d.height, d.predictedHeightTrend].filter(
        (v): v is number => typeof v === "number" && Number.isFinite(v),
      ),
    ),
  );
  const weightMax = Math.max(
    0,
    ...chartData.flatMap((d) =>
      [d.weight, d.predictedWeightTrend].filter(
        (v): v is number => typeof v === "number" && Number.isFinite(v),
      ),
    ),
  );

  const heightTicks = buildTicks(heightMax);
  const weightTicks = buildTicks(weightMax);
  const leftTicks = activeMetric === "weight" ? weightTicks : heightTicks;

  if (history.length === 0) return null;

  return (
    <div className="animate-in slide-in-from-bottom-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm duration-300">
      <div className="mb-4 flex flex-col gap-3">
        <h3 className="pl-1 text-base font-bold tracking-tight text-slate-900">
          กราฟการเจริญเติบโต
        </h3>

        <div className="overflow-x-auto pb-1">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setActiveMetric("both")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                activeMetric === "both"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setActiveMetric("height")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                activeMetric === "height"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              เฉพาะส่วนสูง
            </button>
            <button
              onClick={() => setActiveMetric("weight")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                activeMetric === "weight"
                  ? "bg-white text-orange-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              เฉพาะน้ำหนัก
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="mb-2 text-[11px] font-semibold text-slate-500">
            คำอธิบาย Metric
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              ส่วนสูงจริง
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              น้ำหนักจริง
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              ส่วนสูงที่ทำนาย
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
              น้ำหนักที่ทำนาย
            </span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full rounded-xl border border-slate-200 bg-white p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical
              stroke="rgba(148, 163, 184, 0.35)"
            />

            <XAxis
              dataKey="shortDate"
              axisLine={{ stroke: "rgba(148, 163, 184, 0.8)" }}
              tickLine
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
              tickMargin={8}
              minTickGap={16}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={{ stroke: "rgba(148, 163, 184, 0.8)" }}
              tickLine
              tick={{
                fill: activeMetric === "weight" ? "#ea580c" : "#2563eb",
                fontSize: 11,
                fontWeight: 600,
              }}
              width={44}
              domain={[0, leftTicks[leftTicks.length - 1]]}
              ticks={leftTicks}
              allowDecimals={false}
              tickFormatter={formatNumber}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: "rgba(148, 163, 184, 0.8)" }}
              tickLine
              tick={{ fill: "#ea580c", fontSize: 11, fontWeight: 600 }}
              width={44}
              domain={[0, weightTicks[weightTicks.length - 1]]}
              ticks={weightTicks}
              allowDecimals={false}
              tickFormatter={formatNumber}
              hide={activeMetric !== "both"}
            />

            <Tooltip
              formatter={(value, name) => {
                const numericValue =
                  typeof value === "number" ? value : Number(value);

                if (!Number.isFinite(numericValue)) {
                  return [value, name];
                }

                return [numericValue.toFixed(2), name];
              }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(226,232,240,0.9)",
                boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                fontWeight: 600,
              }}
              labelStyle={{
                color: "#64748b",
                fontWeight: 500,
                fontSize: "12px",
                marginBottom: "2px",
              }}
              itemStyle={{ fontSize: "12px", padding: "1px 0" }}
            />

            {(activeMetric === "both" || activeMetric === "height") && (
              <Line
                yAxisId="left"
                type="monotone"
                name="ส่วนสูง (ซม.)"
                dataKey="height"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#2563eb" }}
              />
            )}

            {(activeMetric === "both" || activeMetric === "height") && (
              <Line
                yAxisId="left"
                type="monotone"
                name="ส่วนสูงที่ทำนาย"
                dataKey="predictedHeightTrend"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 2.5, strokeWidth: 0, fill: "#8b5cf6" }}
                activeDot={{ r: 4, strokeWidth: 0, fill: "#7c3aed" }}
                connectNulls
              />
            )}

            {(activeMetric === "both" || activeMetric === "weight") && (
              <Line
                yAxisId={activeMetric === "weight" ? "left" : "right"}
                type="monotone"
                name="น้ำหนัก (กก.)"
                dataKey="weight"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#ea580c" }}
              />
            )}

            {(activeMetric === "both" || activeMetric === "weight") && (
              <Line
                yAxisId={activeMetric === "weight" ? "left" : "right"}
                type="monotone"
                name="น้ำหนักที่ทำนาย"
                dataKey="predictedWeightTrend"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 2.5, strokeWidth: 0, fill: "#0ea5e9" }}
                activeDot={{ r: 4, strokeWidth: 0, fill: "#0284c7" }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-center text-[11px] text-slate-500">
        เส้นทึบคือค่าจริง และเส้นประคือค่าที่ AI ทำนาย
      </p>
    </div>
  );
}
