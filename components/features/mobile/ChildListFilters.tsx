"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export function ChildListFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [minAge, setMinAge] = useState(searchParams.get("minAge") || "");
  const [maxAge, setMaxAge] = useState(searchParams.get("maxAge") || "");
  const [heightDev, setHeightDev] = useState(
    searchParams.get("heightDev") || "",
  );
  const [weightDev, setWeightDev] = useState(
    searchParams.get("weightDev") || "",
  );
  const [locationId, setLocationId] = useState(
    searchParams.get("locationId") || "",
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.set("page", "1"); // Reset to page 1 on new filter
      router.push(pathname + "?" + params.toString());
    },
    [searchParams, pathname, router],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: search });
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatus(value);
    if (key === "minAge") setMinAge(value);
    if (key === "maxAge") setMaxAge(value);
    if (key === "heightDev") setHeightDev(value);
    if (key === "weightDev") setWeightDev(value);
    if (key === "locationId") setLocationId(value);

    applyFilters({ [key]: value });
  };

  const activeFiltersCount = [
    status,
    minAge || maxAge,
    heightDev,
    weightDev,
    locationId,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex gap-2 w-full">
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            placeholder="ค้นหาชื่อ, นามสกุล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-2xl border-0 py-3.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white"
          />
        </form>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex h-[52px] items-center justify-center gap-2 rounded-2xl px-4 shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${showAdvanced || activeFiltersCount > 0 ? "bg-blue-50 text-blue-700 ring-blue-200" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"}`}
        >
          <div className="relative">
            <SlidersHorizontal className="h-5 w-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {showAdvanced && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gray-50/50 p-4 border border-gray-100">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              สถานะเด็ก
            </label>
            <select
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="block w-full rounded-xl border-0 py-3 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="In_Area">ในเขต (In Area)</option>
              <option value="Out_Area">นอกเขต (Out Area)</option>
              <option value="Unknown">ไม่ทราบ (Unknown)</option>
              <option value="die">เสียชีวิต (Died)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              เขต
            </label>
            {/* TODO: Fetch location data from API */}
            <select
              value={locationId}
              onChange={(e) => handleFilterChange("locationId", e.target.value)}
              className="block w-full rounded-xl border-0 py-3 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="1">เขต 1</option>
              <option value="2">เขต 2</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ช่วงอายุ (ปี)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="ต่ำสุด"
                value={minAge}
                onChange={(e) => handleFilterChange("minAge", e.target.value)}
                className="block w-full rounded-xl border-0 py-3 px-3.5 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
              />
              <span className="text-gray-400 font-medium">-</span>
              <input
                type="number"
                min="0"
                placeholder="สูงสุด"
                value={maxAge}
                onChange={(e) => handleFilterChange("maxAge", e.target.value)}
                className="block w-full rounded-xl border-0 py-3 px-3.5 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              พัฒนาการด้านส่วนสูง (HA)
            </label>
            <select
              value={heightDev}
              onChange={(e) => handleFilterChange("heightDev", e.target.value)}
              className="block w-full rounded-xl border-0 py-3 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="สูง">สูง</option>
              <option value="ค่อนข้างสูง">ค่อนข้างสูง</option>
              <option value="ส่วนสูงตามเกณฑ์">ส่วนสูงตามเกณฑ์</option>
              <option value="ค่อนข้างเตี้ย">ค่อนข้างเตี้ย</option>
              <option value="เตี้ย">เตี้ย</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              พัฒนาการด้านน้ำหนัก (WA)
            </label>
            <select
              value={weightDev}
              onChange={(e) => handleFilterChange("weightDev", e.target.value)}
              className="block w-full rounded-xl border-0 py-3 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="น้ำหนักมากเกินเกณฑ์">น้ำหนักมากเกินเกณฑ์</option>
              <option value="น้ำหนักค่อนข้างมาก">น้ำหนักค่อนข้างมาก</option>
              <option value="น้ำหนักตามเกณฑ์">น้ำหนักตามเกณฑ์</option>
              <option value="ค่อนข้างน้อย">ค่อนข้างน้อย</option>
              <option value="น้ำหนักน้อยกว่าเกณฑ์">น้ำหนักน้อยกว่าเกณฑ์</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
