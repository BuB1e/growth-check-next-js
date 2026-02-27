"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  Cell,
} from "recharts";
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

const chartConfig = {
  normal: {
    label: "สมส่วน",
    color: "#22c55e", // green
  },
  above: {
    label: "สูงกว่าเกณฑ์",
    color: "#eab308", // yellow
  },
  below: {
    label: "ต่ำกว่าเกณฑ์",
    color: "#ef4444", // red
  },
  count: {
    label: "จำนวนเด็ก (คน)",
  },
} satisfies ChartConfig;

const trendDataWeight = [
  { month: "ม.ค.", normal: 120, above: 30, below: 10 },
  { month: "ก.พ.", normal: 135, above: 25, below: 15 },
  { month: "มี.ค.", normal: 150, above: 20, below: 12 },
  { month: "เม.ย.", normal: 160, above: 22, below: 18 },
  { month: "พ.ค.", normal: 145, above: 28, below: 14 },
  { month: "มิ.ย.", normal: 170, above: 15, below: 20 },
];

const trendDataHeight = [
  { month: "ม.ค.", normal: 110, above: 20, below: 30 },
  { month: "ก.พ.", normal: 125, above: 22, below: 28 },
  { month: "มี.ค.", normal: 140, above: 25, below: 17 },
  { month: "เม.ย.", normal: 150, above: 28, below: 22 },
  { month: "พ.ค.", normal: 155, above: 25, below: 18 },
  { month: "มิ.ย.", normal: 165, above: 20, below: 15 },
];

export function ChildHealthTrendChart() {
  const [metric, setMetric] = useState<"weight" | "height">("weight");
  const data = metric === "weight" ? trendDataWeight : trendDataHeight;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-2 justify-end px-4 mt-2">
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
          data={data}
          margin={{ left: 12, right: 12, bottom: 0 }}
        >
          <CartesianGrid vertical={false} opacity={0.4} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="above"
            stroke="var(--color-above)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="normal"
            stroke="var(--color-normal)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="below"
            stroke="var(--color-below)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

const statusData = [
  {
    status: "above",
    label: "สูงกว่าเกณฑ์",
    count: 20,
    fill: "var(--color-above)",
  },
  {
    status: "normal",
    label: "สมส่วน",
    count: 170,
    fill: "var(--color-normal)",
  },
  {
    status: "below",
    label: "ต่ำกว่าเกณฑ์",
    count: 15,
    fill: "var(--color-below)",
  },
];

export function ChildHealthStatusChart() {
  return (
    <div className="w-full p-4">
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <BarChart accessibilityLayer data={statusData} margin={{ top: 20 }}>
          <CartesianGrid vertical={false} opacity={0.4} />
          <XAxis
            dataKey="label"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="count" radius={6} maxBarSize={60}>
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
