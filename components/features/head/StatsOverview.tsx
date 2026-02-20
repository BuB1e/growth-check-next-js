"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { AreaStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Baby, AlertTriangle, BarChart3 } from "lucide-react";

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<AreaStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/stats");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "จำนวนเด็กทั้งหมด",
      value: stats?.totalChildren ?? 0,
      icon: Baby,
      color: "text-blue-600 bg-blue-100",
      suffix: "คน",
    },
    {
      title: "อัตราทุพโภชนาการ",
      value: stats?.malnutritionRate ?? 0,
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-100",
      suffix: "%",
    },
    {
      title: "สุขภาพดี",
      value: stats ? (100 - stats.malnutritionRate).toFixed(1) : 0,
      icon: BarChart3,
      color: "text-green-600 bg-green-100",
      suffix: "%",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {card.title}
            </CardTitle>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {card.value}
              <span className="ml-1 text-lg font-normal text-gray-400">
                {card.suffix}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
