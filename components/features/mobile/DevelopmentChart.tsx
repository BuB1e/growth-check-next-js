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
  Legend,
} from "recharts";
import { formatBE } from "@/lib/date-utils";
import { buildPredictionPoints } from "@/lib/prediction-utils";

interface DevelopmentChartProps {
  history: ChildDataResponse[];
  prediction?: AiPredictionResponse | null;
}

export function DevelopmentChart({ history, prediction = null }: DevelopmentChartProps) {
  const [activeMetric, setActiveMetric] = useState<
    "both" | "height" | "weight"
  >("both");

  // Format data for Recharts (Reverse so it reads left-to-right chronologically)
  const chartData = useMemo(() => {
    const historicalData = [...history]
      .filter((record) => !Number.isNaN(new Date(record.heightDate).getTime()))
      .reverse()
      .map((record) => {
      // Create a short date label "DD MMM"
      const shortDate = formatBE(record.heightDate, "d MMM yy");

      return {
        name: `ครั้งที่ ${record.id}`,
        dateOrder: new Date(record.heightDate).getTime(),
        shortDate,
        height: Number(record.height.toFixed(1)),
        weight: Number(record.weight.toFixed(1)),
      };
    });

    const predictedData = buildPredictionPoints(prediction).map((point, index) => ({
      name: `ทำนาย ${index + 1}`,
      dateOrder: point.predictedDate.getTime(),
      shortDate: formatBE(point.predictedDate, "d MMM yy"),
      predictedHeight: point.predictedHeight,
      predictedWeight: point.predictedWeight,
    }));

    return [...historicalData, ...predictedData]
      .filter((point) => Number.isFinite(point.dateOrder))
      .sort((a, b) => a.dateOrder - b.dateOrder);
  }, [history, prediction]);

  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Chart Header & Toggle Controls */}
      <div className="flex flex-col gap-4 mb-6 relative">
        <h3 className="font-bold text-gray-900 tracking-tight pl-1">
          กราฟการเจริญเติบโต
        </h3>

        {/* iOS-style segmented control */}
        <div className="flex p-1 bg-gray-100/80 rounded-xl relative self-start">
          <button
            onClick={() => setActiveMetric("both")}
            className={`relative z-10 px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200 rounded-lg ${
              activeMetric === "both"
                ? "text-gray-900 shadow-sm bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setActiveMetric("height")}
            className={`relative z-10 px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200 rounded-lg ${
              activeMetric === "height"
                ? "text-blue-700 shadow-sm bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            เปิดเฉพาะส่วนสูง
          </button>
          <button
            onClick={() => setActiveMetric("weight")}
            className={`relative z-10 px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200 rounded-lg ${
              activeMetric === "weight"
                ? "text-orange-700 shadow-sm bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            เปิดเฉพาะน้ำหนัก
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-[300px] w-full mt-4 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="shortDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: activeMetric === "weight" ? "#f97316" : "#3b82f6",
                fontSize: 12,
                fontWeight: 600,
              }}
              dx={-10}
              domain={
                activeMetric === "weight"
                  ? ["dataMin - 2", "dataMax + 2"]
                  : ["dataMin - 5", "dataMax + 5"]
              }
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#f97316", fontSize: 12, fontWeight: 600 }}
              dx={10}
              domain={["dataMin - 2", "dataMax + 2"]}
              hide={activeMetric !== "both"}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontWeight: 600,
              }}
              labelStyle={{
                color: "#64748b",
                fontWeight: 500,
                fontSize: "13px",
                marginBottom: "4px",
              }}
              itemStyle={{ fontSize: "14px", padding: "2px 0" }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
                paddingBottom: "10px",
              }}
            />

            {(activeMetric === "both" || activeMetric === "height") && (
              <Line
                yAxisId="left"
                type="monotone"
                name="ส่วนสูง (ซม.)"
                dataKey="height"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
              />
            )}

            {(activeMetric === "both" || activeMetric === "height") && (
              <Line
                yAxisId="left"
                type="monotone"
                name="ส่วนสูงที่ทำนาย"
                dataKey="predictedHeight"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3, strokeWidth: 0, fill: "#8b5cf6" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#7c3aed" }}
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
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#ea580c" }}
              />
            )}

            {(activeMetric === "both" || activeMetric === "weight") && (
              <Line
                yAxisId={activeMetric === "weight" ? "left" : "right"}
                type="monotone"
                name="น้ำหนักที่ทำนาย"
                dataKey="predictedWeight"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3, strokeWidth: 0, fill: "#0ea5e9" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#0284c7" }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
