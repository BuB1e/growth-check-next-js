import type { AiPredictionResponse, DevelopmentResponse } from "@/dto";
import { getGrowthColor } from "./growth-utils";

type PredictionValue = number | number[];

function toArray(value: PredictionValue): number[] {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "number" && Number.isFinite(item));
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return [value];
  }

  return [];
}

export function getPredictionSeries(
  prediction: AiPredictionResponse | null | undefined,
): { heightSeries: number[]; weightSeries: number[] } {
  if (!prediction) {
    return { heightSeries: [], weightSeries: [] };
  }

  return {
    heightSeries: toArray(prediction.height),
    weightSeries: toArray(prediction.weight),
  };
}

export function getPredictionSummaryValue(
  value: PredictionValue,
): number | null {
  const series = toArray(value);
  if (series.length === 0) {
    return null;
  }

  return series[series.length - 1] ?? null;
}

export function buildPredictionPoints(
  prediction: AiPredictionResponse | null | undefined,
  options?: {
    anchorDate?: Date;
    developments?: DevelopmentResponse[];
  },
): Array<{
  predictedDate: Date;
  predictedHeight?: number;
  predictedWeight?: number;
  heightColor?: string;
  weightColor?: string;
}> {
  if (!prediction) {
    return [];
  }

  const { heightSeries, weightSeries } = getPredictionSeries(prediction);
  const maxLen = Math.max(heightSeries.length, weightSeries.length);

  if (maxLen === 0) {
    return [];
  }

  const anchorBase = options?.anchorDate ? new Date(options.anchorDate) : null;
  const createdAtBase = new Date(prediction.createdAt);
  const baseDate =
    anchorBase && !Number.isNaN(anchorBase.getTime())
      ? anchorBase
      : createdAtBase;

  if (Number.isNaN(baseDate.getTime())) {
    return [];
  }

  // Use month if available, otherwise default to 1
  const monthStep = 1;
  const developments = options?.developments || [];

  return Array.from({ length: maxLen }, (_, index) => {
    const predictedDate = new Date(baseDate);
    predictedDate.setMonth(predictedDate.getMonth() + monthStep * (index + 1));

    // Resolve HA status/color
    let hColor: string | undefined = undefined;
    const hDevObj = prediction.heightDevelopmentList?.[index];
    if (hDevObj) {
      hColor = getGrowthColor("HA", hDevObj.status);
    } else {
      const hDevId = 
        prediction.heightDevelopmentIdList?.[index] ?? 
        prediction.heightDevelopmentIds?.[index];
      if (hDevId && developments.length > 0) {
        const found = developments.find(d => d.id === hDevId);
        if (found) hColor = getGrowthColor("HA", found.status);
      }
    }

    // Resolve WA status/color
    let wColor: string | undefined = undefined;
    const wDevObj = prediction.weightDevelopmentList?.[index];
    if (wDevObj) {
      wColor = getGrowthColor("WA", wDevObj.status);
    } else {
      const wDevId = 
        prediction.weightDevelopmentIdList?.[index] ?? 
        prediction.weightDevelopmentIds?.[index];
      if (wDevId && developments.length > 0) {
        const found = developments.find(d => d.id === wDevId);
        if (found) wColor = getGrowthColor("WA", found.status);
      }
    }

    return {
      predictedDate,
      predictedHeight: heightSeries[index],
      predictedWeight: weightSeries[index],
      heightColor: hColor,
      weightColor: wColor,
    };
  });
}
