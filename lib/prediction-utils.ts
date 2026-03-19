import type { AiPredictionResponse } from "@/dto";

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
  },
): Array<{
  predictedDate: Date;
  predictedHeight?: number;
  predictedWeight?: number;
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
  const dateTimeBase = new Date(prediction.dateTime);
  const createdAtBase = new Date(prediction.createdAt);
  const baseDate =
    anchorBase && !Number.isNaN(anchorBase.getTime())
      ? anchorBase
      : Number.isNaN(dateTimeBase.getTime())
        ? createdAtBase
        : dateTimeBase;

  if (Number.isNaN(baseDate.getTime())) {
    return [];
  }

  const monthStep = Math.max(1, prediction.month || 1);

  return Array.from({ length: maxLen }, (_, index) => {
    const predictedDate = new Date(baseDate);
    predictedDate.setMonth(predictedDate.getMonth() + monthStep * (index + 1));

    return {
      predictedDate,
      predictedHeight: heightSeries[index],
      predictedWeight: weightSeries[index],
    };
  });
}
