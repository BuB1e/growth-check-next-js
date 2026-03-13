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

  // Format data points from real API data
  const chartData = data.map((d) => ({
    date: d.heightDate,
    weight: d.weight,
    height: d.height,
    formattedDate: formatBE(d.heightDate, "MMM yyyy"),
  }));

  // Dynamic Y-axis domain based on actual data
  const values = chartData.map((d) => d[metric]);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  const padding = (maxVal - minVal) * 0.2 || 10;
  const yAxisDomain = [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];

  // Reference zone: approximate normal growth range
  const referenceZone =
    metric === "weight"
      ? { y1: Math.floor(minVal - padding * 0.5), y2: Math.ceil(maxVal + padding * 0.5), color: "hsl(var(--muted)/0.3)" }
      : { y1: Math.floor(minVal - padding * 0.5), y2: Math.ceil(maxVal + padding * 0.5), color: "hsl(var(--muted)/0.3)" };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        ยังไม่มีข้อมูลการวัดสำหรับแสดงกราฟ
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-2 justify-end mt-2">
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

      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 12, right: 12, bottom: 0 }}
        >
          <CartesianGrid vertical={false} opacity={0.4} />
          <XAxis
            dataKey="formattedDate"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
          />
          <YAxis domain={yAxisDomain} hide />
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
      <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground mt-4">
        <div className="h-3 w-4 rounded-sm bg-muted-foreground/20" />
        พื้นที่สีเทาคือช่วงเกณฑ์การเจริญเติบโตที่คาดหวัง (สมส่วน)
      </div>
    </div>
  );
}
