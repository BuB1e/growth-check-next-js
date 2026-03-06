"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { th } from "date-fns/locale";
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

interface GrowthChartProps {
  childId: number;
}

// TODO: Temporary individual mock history data matching real measurement data points format
const mockGrowthHistory = [
  { date: "2023-01-10", weight: 22.5, height: 110 },
  { date: "2023-04-12", weight: 23.2, height: 112 },
  { date: "2023-08-05", weight: 25.1, height: 114 },
  { date: "2023-12-15", weight: 26.8, height: 118 },
  { date: "2024-03-20", weight: 28.1, height: 121 },
  { date: "2024-06-15", weight: 29.5, height: 123 },
];

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

export function GrowthChart({ childId: _childId }: GrowthChartProps) {
  const [metric, setMetric] = useState<"weight" | "height">("weight");

  // Format data points for correct rendering and sorting
  const chartData = mockGrowthHistory.map((d) => ({
    ...d,
    formattedDate: formatBE(d.date, "MMM yyyy"),
  }));

  // Render a reference line denoting normal growth channels.
  // Normally this would be dynamic calculated based on age array logic from the Department of Health.
  // TODO: Hardcoding mock Safe Zone for illustration
  const yAxisDomain = metric === "weight" ? [15, 35] : [100, 140];
  const referenceZone =
    metric === "weight"
      ? { y1: 20, y2: 30, color: "hsl(var(--muted)/0.3)" }
      : { y1: 105, y2: 130, color: "hsl(var(--muted)/0.3)" };

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
          {/* Reference Safe Area (Normal thresholds wrapper mockup) */}
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
