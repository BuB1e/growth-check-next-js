"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { formatBE } from "@/lib/date-utils";
import { buildPredictionPoints } from "@/lib/prediction-utils";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AiPredictionResponse, ChildDataResponse } from "@/dto";

interface GrowthChartProps {
  childId: number;
  data?: ChildDataResponse[];
  prediction?: AiPredictionResponse | null;
}

const chartConfig = {
  weight: {
    label: "น้ำหนักจริง (กก.)",
    color: "#f97316", // orange-500
  },
  height: {
    label: "ส่วนสูงจริง (ซม.)",
    color: "#3b82f6", // blue-500
  },
  predictedWeight: {
    label: "น้ำหนักที่ทำนาย",
    color: "#0ea5e9", // cyan-500
  },
  predictedHeight: {
    label: "ส่วนสูงที่ทำนาย",
    color: "#8b5cf6", // violet-500
  },
} satisfies ChartConfig;

export function GrowthChart({
  data = [],
  prediction = null,
}: GrowthChartProps) {
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

  const historicalData = [...data]
    .filter((d) => !Number.isNaN(new Date(d.heightDate).getTime()))
    .sort(
      (a, b) =>
        new Date(a.heightDate).getTime() - new Date(b.heightDate).getTime(),
    )
    .map((d) => ({
      date: new Date(d.heightDate),
      weight: d.weight,
      height: d.height,
      predictedWeightTrend: undefined as number | undefined,
      predictedHeightTrend: undefined as number | undefined,
      formattedDate: formatBE(d.heightDate, "d MMM yy"),
    }));

  const latestHistoricalDate = historicalData[historicalData.length - 1]?.date;
  const predictionPoints = buildPredictionPoints(prediction, {
    anchorDate: latestHistoricalDate,
  });

  if (historicalData.length > 0 && predictionPoints.length > 0) {
    const lastIndex = historicalData.length - 1;
    const last = historicalData[lastIndex];
    historicalData[lastIndex] = {
      ...last,
      predictedWeightTrend: last.weight,
      predictedHeightTrend: last.height,
    };
  }

  const chartData = [
    ...historicalData,
    ...predictionPoints.map((point) => ({
      date: point.predictedDate,
      predictedWeight: point.predictedWeight,
      predictedHeight: point.predictedHeight,
      predictedWeightTrend: point.predictedWeight,
      predictedHeightTrend: point.predictedHeight,
      formattedDate: formatBE(point.predictedDate, "d MMM yy"),
    })),
  ]
    .filter((d) => !Number.isNaN(d.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const weightValues = [
    ...historicalData.map((d) => d.weight),
    ...predictionPoints
      .map((point) => point.predictedWeight)
      .filter((value): value is number => typeof value === "number"),
  ];

  const heightValues = [
    ...historicalData.map((d) => d.height),
    ...predictionPoints
      .map((point) => point.predictedHeight)
      .filter((value): value is number => typeof value === "number"),
  ];

  const weightTicks = buildTicks(Math.max(0, ...weightValues));
  const heightTicks = buildTicks(Math.max(0, ...heightValues));
  const weightDomain: [number, number] = [0, weightTicks[weightTicks.length - 1]];
  const heightDomain: [number, number] = [0, heightTicks[heightTicks.length - 1]];
  const latest = historicalData[historicalData.length - 1];

  if (historicalData.length === 0) {
    return (
      <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
        ยังไม่มีข้อมูลการวัดสำหรับแสดงกราฟ
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl border bg-slate-50/70 px-3 py-2 text-sm">
          <p className="text-muted-foreground">น้ำหนักล่าสุด</p>
          <p className="font-semibold text-foreground">
            {latest.weight.toFixed(1)} กก.
          </p>
        </div>

        <div className="rounded-xl border bg-slate-50/70 px-3 py-2 text-sm">
          <p className="text-muted-foreground">ส่วนสูงล่าสุด</p>
          <p className="font-semibold text-foreground">
            {latest.height.toFixed(1)} ซม.
          </p>
        </div>

        <div className="rounded-xl border bg-slate-50/70 px-3 py-2 text-sm">
          <p className="text-muted-foreground">จำนวนครั้งที่วัด</p>
          <p className="font-semibold text-foreground">{historicalData.length} ครั้ง</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-500">
          คำอธิบาย Metric
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-700">
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

      <ChartContainer
        config={chartConfig}
        className="min-h-80 w-full rounded-xl border border-slate-200 bg-white p-2"
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 12, right: 12, bottom: 0 }}
        >
          <CartesianGrid
            vertical
            stroke="rgba(148, 163, 184, 0.35)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="formattedDate"
            tickLine
            tickMargin={8}
            axisLine={{ stroke: "rgba(148, 163, 184, 0.7)" }}
            minTickGap={20}
            tick={{ fontSize: 12, fill: "#334155" }}
          />
          <YAxis
            yAxisId="weight"
            domain={weightDomain}
            ticks={weightTicks}
            allowDecimals={false}
            tickLine
            axisLine={{ stroke: "rgba(148, 163, 184, 0.7)" }}
            tick={{ fontSize: 12, fill: "#9a3412" }}
            width={52}
            tickFormatter={formatNumber}
            label={{
              value: "น้ำหนัก (กก.)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#9a3412", fontSize: 12, fontWeight: 600 },
            }}
          />
          <YAxis
            yAxisId="height"
            orientation="right"
            domain={heightDomain}
            ticks={heightTicks}
            allowDecimals={false}
            tickLine
            axisLine={{ stroke: "rgba(148, 163, 184, 0.7)" }}
            tick={{ fontSize: 12, fill: "#1e40af" }}
            width={52}
            tickFormatter={formatNumber}
            label={{
              value: "ส่วนสูง (ซม.)",
              angle: 90,
              position: "insideRight",
              style: { fill: "#1e40af", fontSize: 12, fontWeight: 600 },
            }}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value);

                  if (!Number.isFinite(numericValue)) {
                    return [value, name];
                  }

                  return [numericValue.toFixed(2), name];
                }}
              />
            }
          />

          <Line
            type="monotone"
            yAxisId="weight"
            dataKey="weight"
            stroke="var(--color-weight)"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--color-weight)" }}
            activeDot={{ r: 6 }}
            name="น้ำหนักจริง"
          />
          <Line
            type="monotone"
            yAxisId="height"
            dataKey="height"
            stroke="var(--color-height)"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--color-height)" }}
            activeDot={{ r: 6 }}
            name="ส่วนสูงจริง"
          />
          <Line
            type="monotone"
            yAxisId="weight"
            dataKey="predictedWeightTrend"
            stroke="var(--color-predictedWeight)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 3, fill: "var(--color-predictedWeight)" }}
            activeDot={{ r: 5 }}
            connectNulls
            name="น้ำหนักที่ทำนาย"
          />
          <Line
            type="monotone"
            yAxisId="height"
            dataKey="predictedHeightTrend"
            stroke="var(--color-predictedHeight)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 3, fill: "var(--color-predictedHeight)" }}
            activeDot={{ r: 5 }}
            connectNulls
            name="ส่วนสูงที่ทำนาย"
          />
        </LineChart>
      </ChartContainer>
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        เส้นทึบคือค่าจริง และเส้นประคือค่าที่ AI ทำนาย
      </div>
    </div>
  );
}
