"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateRangePicker } from "./date-range-picker";
import { LocationResponse } from "@/dto";
import { Sex, SexToThai } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      if (value && value !== "all") {
        params.set("ageRange", value);
      } else {
        params.delete("ageRange");
      }
    } else {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker />

      <Select
        value={searchParams.get("locationId") || "all"}
        onValueChange={(val) => handleFilterChange("locationId", val)}
      >
        <SelectTrigger className="w-[180px] h-10 bg-white border-slate-200 rounded-xl shadow-sm">
          <SelectValue placeholder="ทุกเขตพื้นที่" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200">
          <SelectItem value="all">ทุกเขตพื้นที่</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc.id} value={loc.id.toString()}>
              {loc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("ageRange") || "all"}
        onValueChange={(val) => handleFilterChange("ageRange", val)}
      >
        <SelectTrigger className="w-[180px] h-10 bg-white border-slate-200 rounded-xl shadow-sm">
          <SelectValue placeholder="ทุกช่วงอายุ" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200">
          <SelectItem value="all">ทุกช่วงอายุ</SelectItem>
          <SelectItem value="0-1">เด็กทารก (0-1 ปี)</SelectItem>
          <SelectItem value="1-3">เด็กวัยหัดเดิน (1-3 ปี)</SelectItem>
          <SelectItem value="3-5">เด็กวัยก่อนเรียน (3-5 ปี)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("sex") || "all"}
        onValueChange={(val) => handleFilterChange("sex", val)}
      >
        <SelectTrigger className="w-[140px] h-10 bg-white border-slate-200 rounded-xl shadow-sm">
          <SelectValue placeholder="ทุกเพศ" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200">
          <SelectItem value="all">ทุกเพศ</SelectItem>
          <SelectItem value={Sex.MALE}>{SexToThai[Sex.MALE]}</SelectItem>
          <SelectItem value={Sex.FEMALE}>{SexToThai[Sex.FEMALE]}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
