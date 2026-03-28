import { DevelopmentStatus, Metric_type } from "@/types";

/**
 * Returns a consistent hex color for a given growth metric and its status.
 *
 * HA (Height-for-Age):
 * - Tall (สูงกว่าเกณฑ์) -> Yellow
 * - Normal (ปกติ) -> Green
 * - Stunted (ต่ำกว่าเกณฑ์) -> Red
 *
 * WA (Weight-for-Age):
 * - Overweight (สูงกว่าเกณฑ์) -> Red
 * - Normal (ปกติ) -> Green
 * - Underweight (ต่ำกว่าเกณฑ์) -> Yellow
 */
export function getGrowthColor(metric: Metric_type, status: DevelopmentStatus): string {
  if (metric === "HA") {
    switch (status) {
      case "HA_TALL_FOR_AGE":
        return "#eab308"; // Yellow-500
      case "HA_NORMAL_HEIGHT_FOR_AGE":
        return "#22c55e"; // Green-500
      case "HA_STUNTED_FOR_AGE":
        return "#ef4444"; // Red-500
      default:
        return "#3b82f6"; // Default Blue for Height
    }
  }

  if (metric === "WA") {
    switch (status) {
      case "WA_OVERWEIGHT_FOR_AGE":
        return "#ef4444"; // Red-500
      case "WA_NORMAL_WEIGHT_FOR_AGE":
        return "#22c55e"; // Green-500
      case "WA_UNDERWEIGHT_FOR_AGE":
        return "#eab308"; // Yellow-500
      default:
        return "#f97316"; // Default Orange for Weight
    }
  }

  return "#94a3b8"; // Muted Slate for others
}
