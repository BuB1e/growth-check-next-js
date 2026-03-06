import { format as dateFnsFormat } from "date-fns";
import { th } from "date-fns/locale";

/**
 * Format date to "dd-MM-yyyy" where yyyy is the Buddhist Era (BE) year.
 * @param date The date to format
 * @param formatStr The desired format (default: "dd-MM-yyyy")
 * @returns The formatted date string
 */
export function formatBE(
  date: Date | number | string,
  formatStr: string = "dd-MM-yyyy",
): string {
  if (!date) return "";
  const d = new Date(date);

  // Calculate Buddhist Era year
  const beYear = d.getFullYear() + 543;

  // Create a string with the same format tokens, but replace the year part manually since date-fns doesn't fully support custom years easily without complex locale hacks.
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");

  if (formatStr === "dd-MM-yyyy") {
    return `${day}-${month}-${beYear}`;
  }

  // Fallback to a basic string replace for custom formats if needed, or just return the default
  const result = dateFnsFormat(d, formatStr, { locale: th });
  return result.replace(d.getFullYear().toString(), beYear.toString());
}
