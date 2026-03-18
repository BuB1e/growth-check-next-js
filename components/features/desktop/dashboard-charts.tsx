"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
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
    color: "#22c55e",
  },
  above: {
    label: "สูงกว่าเกณฑ์",
    color: "#eab308",
  },
  below: {
    label: "ต่ำกว่าเกณฑ์",
    color: "#ef4444",
  },
  count: {
    label: "จำนวนเด็ก (คน)",
  },
} satisfies ChartConfig;

export interface DashboardTrendItem {
  month: string;
  normal: number;
  above: number;
  below: number;
}

export interface DashboardStatusItem {
  status: "above" | "normal" | "below";
  label: string;
  count: number;
  fill: string;
  color: string;
  desc: string;
}

// ─── Metric summary chip ────────────────────────────────────────────────────
function MetricChip({
  label,
  value,
  color,
  pct,
}: {
  label: string;
  value: number;
  color: string;
  pct: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card shadow-sm min-w-[120px]">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ background: color }}
      />
      <div className="text-sm leading-tight">
        <p className="text-muted-foreground font-medium">{label}</p>
        <p className="font-bold text-foreground">
          {value} คน{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({pct}%)
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── Trend chart ─────────────────────────────────────────────────────────────
export function ChildHealthTrendChart({
  trendDataWeight = [],
  trendDataHeight = [],
}: {
  trendDataWeight?: DashboardTrendItem[];
  trendDataHeight?: DashboardTrendItem[];
}) {
  const [metric, setMetric] = useState<"weight" | "height">("weight");
  const data = metric === "weight" ? trendDataWeight : trendDataHeight;

  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        ยังไม่มีข้อมูลแนวโน้มสำหรับแสดงกราฟ
      </div>
    );
  }

  // Current month totals for the metric chips
  const latest = data[data.length - 1];
  const total = latest.normal + latest.above + latest.below;
  const pct = (n: number) => ((n / total) * 100).toFixed(0);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Metric toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 mt-2">
        <p className="text-sm text-muted-foreground">
          {metric === "weight" ? "เกณฑ์น้ำหนัก" : "เกณฑ์ส่วนสูง"} —
          จำนวนเด็กรายเดือน (6 เดือนล่าสุด)
        </p>
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

      {/* Metric summary row (latest month) */}
      <div className="flex flex-wrap gap-2 px-4">
        <MetricChip
          label="สมส่วน"
          value={latest.normal}
          color="#22c55e"
          pct={pct(latest.normal)}
        />
        <MetricChip
          label="สูงกว่าเกณฑ์"
          value={latest.above}
          color="#eab308"
          pct={pct(latest.above)}
        />
        <MetricChip
          label="ต่ำกว่าเกณฑ์"
          value={latest.below}
          color="#ef4444"
          pct={pct(latest.below)}
        />
      </div>

      <ChartContainer
        config={chartConfig}
        className="min-h-[200px] md:min-h-[260px] w-full"
      >
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ left: 4, right: 12, bottom: 0, top: 4 }}
        >
          <CartesianGrid vertical={false} opacity={0.3} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
            tick={{ fontSize: 13 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}`}
            width={36}
            label={{
              value: "คน",
              position: "insideTopLeft",
              offset: 4,
              fontSize: 11,
              fill: "#94a3b8",
            }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  `${value} คน`,
                  chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                ]}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="above"
            stroke="var(--color-above)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="normal"
            stroke="var(--color-normal)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="below"
            stroke="var(--color-below)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

// ─── Status chart ─────────────────────────────────────────────────────────────
export function ChildHealthStatusChart({
  statusData = [],
}: {
  statusData?: DashboardStatusItem[];
}) {
  if (!statusData.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        ยังไม่มีข้อมูลสถานะการเจริญเติบโต
      </div>
    );
  }

  const total = statusData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="w-full flex flex-col gap-3 p-2 md:p-4">
      {/* Legend with descriptions */}
      <div className="space-y-1.5">
        {statusData.map((d) => (
          <div key={d.status} className="flex items-start gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full mt-1 shrink-0"
              style={{ background: d.color }}
            />
            <div className="leading-tight">
              <span className="font-semibold">{d.label}</span>
              <span className="text-muted-foreground ml-1.5">
                ({d.count} คน · {((d.count / total) * 100).toFixed(0)}%)
              </span>
              <p className="text-xs text-muted-foreground">{d.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <ChartContainer
        config={chartConfig}
        className="min-h-[200px] md:min-h-[220px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={statusData}
          margin={{ top: 24, left: 0, right: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} opacity={0.3} />
          <XAxis
            dataKey="label"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: 13 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={36}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => [`${value} คน`, "จำนวนเด็ก"]}
                hideLabel
              />
            }
          />
          <Bar dataKey="count" radius={8} maxBarSize={72}>
            <LabelList
              dataKey="count"
              position="top"
              formatter={(v: number) => `${v} คน`}
              style={{ fontSize: 13, fontWeight: 600, fill: "#475569" }}
            />
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
