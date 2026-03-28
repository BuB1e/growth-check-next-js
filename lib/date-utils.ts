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
  if (Number.isNaN(d.getTime())) return "-";

  // Calculate Buddhist Era year
  const beYear = d.getFullYear() + 543;
  const beYearShort = beYear.toString().slice(-2);

  // Create a string with the same format tokens, but replace the year part manually since date-fns doesn't fully support custom years easily without complex locale hacks.
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");

  if (formatStr === "dd-MM-yyyy") {
    return `${day}-${month}-${beYear}`;
  }

  // Support both BE full year (yyyy) and BE short year (yy), e.g. "d MMM yy" => "5 ธ.ค. 68"
  const YEAR_FULL_TOKEN = "§§1§§";
  const YEAR_SHORT_TOKEN = "§§2§§";

  const tokenizedFormat = formatStr
    .replace(/yyyy/g, YEAR_FULL_TOKEN)
    .replace(/yy/g, YEAR_SHORT_TOKEN);

  const result = dateFnsFormat(d, tokenizedFormat, { locale: th });

  return result
    .replace(new RegExp(YEAR_FULL_TOKEN, "g"), beYear.toString())
    .replace(new RegExp(YEAR_SHORT_TOKEN, "g"), beYearShort);
}

export function formatAgeThai(
  birthDate: Date | number | string,
  nowDate: Date | number | string = new Date(),
): string {
  if (!birthDate) return "-";

  const birth = new Date(birthDate);
  const now = new Date(nowDate);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(now.getTime())) {
    return "-";
  }

  if (birth > now) {
    return "-";
  }

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) {
    return `${Math.max(months, 0)} เดือน`;
  }

  if (months <= 0) {
    return `${years} ปี`;
  }

  return `${years} ปี ${months} เดือน`;
}

/**
 * Calculates the exact age in years and months between a birth date and a target date.
 * Useful for child growth data entries.
 */
export function calculateAge(
  birthDate: Date | number | string,
  targetDate: Date | number | string = new Date(),
): { years: number; months: number } {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime())) {
    return { years: 0, months: 0 };
  }

  if (birth > target) {
    return { years: 0, months: 0 };
  }

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();

  if (target.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.max(years, 0), months: Math.max(months, 0) };
}

/**
 * Format dynamic total month count to "X ปี Y เดือน" or "Y เดือน".
 * @param totalMonths Total age in months
 * @returns Formatted Thai age string
 */
export function formatAgeMonthsThai(totalMonths: number): string {
  if (totalMonths < 0) return "-";
  if (totalMonths < 12) return `${totalMonths} เดือน`;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) {
    return `${years} ปี`;
  }

  return `${years} ปี ${months} เดือน`;
}
