"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateRangePicker } from "./date-range-picker";
import { LocationResponse } from "@/dto";
import { Sex, SexToThai } from "@/types";

export function DashboardFilters({
  locations,
}: {
  locations: LocationResponse[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "ageRange") {
      if (value === "0-1") {
        params.set("minAge", "0");
        params.set("maxAge", "12");
      } else if (value === "1-3") {
        params.set("minAge", "12");
        params.set("maxAge", "36");
      } else if (value === "3-5") {
        params.set("minAge", "36");
        params.set("maxAge", "60");
      } else {
        params.delete("minAge");
        params.delete("maxAge");
      }
      if (value) {
        params.set("ageRange", value);
      } else {
        params.delete("ageRange");
      }
    } else {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateRangePicker />

      <select
        className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
        value={searchParams.get("locationId") || ""}
        onChange={(e) => handleFilterChange("locationId", e.target.value)}
      >
        <option value="">ทุกเขตพื้นที่</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id.toString()}>
            {loc.name}
          </option>
        ))}
      </select>

      <select
        className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
        value={searchParams.get("ageRange") || ""}
        onChange={(e) => handleFilterChange("ageRange", e.target.value)}
      >
        <option value="">ทุกช่วงอายุ</option>
        <option value="0-1">เด็กทารก (0-1 ปี)</option>
        {/* เด็กวัยหัดเดิน == Toddler */}
        <option value="1-3">เด็กวัยหัดเดิน (1-3 ปี)</option>
        <option value="3-5">เด็กวัยก่อนเรียน (3-5 ปี)</option>
      </select>

      <select
        className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
        value={searchParams.get("sex") || ""}
        onChange={(e) => handleFilterChange("sex", e.target.value)}
      >
        <option value="">ทุกเพศ</option>
        <option value={Sex.MALE}>{SexToThai[Sex.MALE]}</option>
        <option value={Sex.FEMALE}>{SexToThai[Sex.FEMALE]}</option>
      </select>
    </div>
  );
}
