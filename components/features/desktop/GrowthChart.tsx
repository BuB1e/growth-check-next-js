"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  XAxis,
  YAxis,
} from "recharts";
import { formatBE } from "@/lib/date-utils";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ChildDataResponse } from "@/dto";

interface GrowthChartProps {
  childId: number;
  data?: ChildDataResponse[];
}

const chartConfig = {
  weight: {
    label: "น้ำหนัก (กิโลกรัม)",
    color: "#22c55e",
  },
  height: {
    label: "ส่วนสูง (เซนติเมตร)",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function GrowthChart({ childId: _childId, data = [] }: GrowthChartProps) {
  const [metric, setMetric] = useState<"weight" | "height">("weight");

  // Format and sort data points chronologically for clearer trend reading.
  const chartData = [...data]
    .sort(
      (a, b) =>
        new Date(a.heightDate).getTime() - new Date(b.heightDate).getTime(),
    )
    .map((d) => ({
      date: d.heightDate,
      weight: d.weight,
      height: d.height,
      formattedDate: formatBE(d.heightDate, "d MMM yy"),
    }));

  // Dynamic Y-axis domain based on actual data
  const values = chartData.map((d) => d[metric]);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  const padding = (maxVal - minVal) * 0.2 || 10;
  const yAxisDomain = [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
  const latest = chartData[chartData.length - 1];
  const unit = metric === "weight" ? "กก." : "ซม.";

  // Reference zone: approximate normal growth range
  const referenceZone =
    metric === "weight"
      ? {
          y1: Math.floor(minVal - padding * 0.5),
          y2: Math.ceil(maxVal + padding * 0.5),
          color: "rgba(226, 232, 240, 0.28)",
        }
      : {
          y1: Math.floor(minVal - padding * 0.5),
          y2: Math.ceil(maxVal + padding * 0.5),
          color: "rgba(226, 232, 240, 0.28)",
        };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        ยังไม่มีข้อมูลการวัดสำหรับแสดงกราฟ
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl border bg-slate-50/70 px-3 py-2 text-sm">
          <p className="text-muted-foreground">ค่าล่าสุด</p>
          <p className="font-semibold text-foreground">
            {metric === "weight"
              ? latest.weight.toFixed(1)
              : latest.height.toFixed(1)}{" "}
            {unit}
          </p>
        </div>

        <div className="rounded-xl border bg-slate-50/70 px-3 py-2 text-sm">
          <p className="text-muted-foreground">จำนวนครั้งที่วัด</p>
          <p className="font-semibold text-foreground">{chartData.length} ครั้ง</p>
        </div>

        <div className="flex gap-2">
        <Button
          variant={metric === "weight" ? "default" : "outline"}
          size="sm"
          onClick={() => setMetric("weight")}
        >
          น้ำหนัก
        </Button>
        <Button
          variant={metric === "height" ? "default" : "outline"}
          size="sm"
          onClick={() => setMetric("height")}
        >
          ส่วนสูง
        </Button>
        </div>
      </div>

      <ChartContainer
        config={chartConfig}
        className="min-h-[320px] w-full rounded-xl bg-slate-50/40 p-2"
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 12, right: 12, bottom: 0 }}
        >
          <CartesianGrid vertical={false} opacity={0.2} strokeDasharray="3 3" />
          <XAxis
            dataKey="formattedDate"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={yAxisDomain}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={42}
          />
          <ReferenceArea
            y1={referenceZone.y1}
            y2={referenceZone.y2}
            fill={referenceZone.color}
            strokeOpacity={0}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<ChartTooltipContent />}
          />
          <ChartLegend content={<ChartLegendContent />} />

          <Line
            type="monotone"
            dataKey={metric}
            stroke={`var(--color-${metric})`}
            strokeWidth={3}
            dot={{ r: 4, fill: `var(--color-${metric})` }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="h-3 w-4 rounded-sm bg-slate-300/60" />
        พื้นที่สีเทาคือช่วงเกณฑ์การเจริญเติบโตที่คาดหวัง (สมส่วน)
      </div>
    </div>
  );
}
