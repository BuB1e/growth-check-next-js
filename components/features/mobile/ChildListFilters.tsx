"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Sex, SexToThai } from "@/types";

export function ChildListFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [minAgeYears, setMinAgeYears] = useState(
    searchParams.get("minAgeYears") || "",
  );
  const [maxAgeYears, setMaxAgeYears] = useState(
    searchParams.get("maxAgeYears") || "",
  );
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
  const [sex, setSex] = useState(searchParams.get("sex") || "");

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
    if (key === "minAgeYears") setMinAgeYears(value);
    if (key === "maxAgeYears") setMaxAgeYears(value);
    // Clamp month values to 0–11 (months cannot exceed 11)
    if (key === "minAge") {
      const num = parseInt(value, 10);
      setMinAge(value === "" ? "" : String(Math.min(Math.max(num || 0, 0), 11)));
    }
    if (key === "maxAge") {
      const num = parseInt(value, 10);
      setMaxAge(value === "" ? "" : String(Math.min(Math.max(num || 0, 0), 11)));
    }
    if (key === "heightDev") setHeightDev(value);
    if (key === "weightDev") setWeightDev(value);
    if (key === "locationId") setLocationId(value);
    if (key === "sex") setSex(value);
  };

  const applyAdvancedFilters = () => {
    applyFilters({
      status,
      minAgeYears,
      maxAgeYears,
      minAge,
      maxAge,
      heightDev,
      weightDev,
      locationId,
      sex,
    });
    setShowAdvanced(false);
  };

  const clearFilters = () => {
    setStatus("");
    setMinAgeYears("");
    setMaxAgeYears("");
    setMinAge("");
    setMaxAge("");
    setHeightDev("");
    setWeightDev("");
    setLocationId("");
    setSex("");
    applyFilters({
      status: "",
      minAgeYears: "",
      maxAgeYears: "",
      minAge: "",
      maxAge: "",
      heightDev: "",
      weightDev: "",
      locationId: "",
      sex: "",
    });
  };

  const activeFiltersCount = [
    status,
    minAgeYears || maxAgeYears || minAge || maxAge,
    heightDev,
    weightDev,
    locationId,
    sex,
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
          {/* Sex filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              เพศ
            </label>
            <select
              value={sex}
              onChange={(e) => handleFilterChange("sex", e.target.value)}
              className="block w-full rounded-xl border-0 py-3 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value={Sex.MALE}>{SexToThai[Sex.MALE]}</option>
              <option value={Sex.FEMALE}>{SexToThai[Sex.FEMALE]}</option>
            </select>
          </div>
          
          {/* Child Status filter, which is not necessary. AND NOT BEING USE NOW IN BUSINESS LOGIC*/}
          {/*<div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              สถานะเด็ก
            </label>
            <select
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="block w-full rounded-xl border-0 py-3 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value={Child_status.IN_AREA}>
                {Child_statusToThai[Child_status.IN_AREA]}
              </option>
              <option value={Child_status.OUT_AREA}>
                {Child_statusToThai[Child_status.OUT_AREA]}
              </option>
              <option value={Child_status.UNKNOWN}>
                {Child_statusToThai[Child_status.UNKNOWN]}
              </option>
              <option value={Child_status.DIED}>
                {Child_statusToThai[Child_status.DIED]}
              </option>
            </select>
          </div>*/}

          {/* Location filter, which is not necessary. AND NOT BEING USE NOW IN BUSINESS LOGIC*/}
          {/*<div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              เขต
            </label>
            <select
              value={locationId}
              onChange={(e) => handleFilterChange("locationId", e.target.value)}
              className="block w-full rounded-xl border-0 py-3 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="1">เขต 1</option>
              <option value="2">เขต 2</option>
            </select>
          </div>*/}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ช่วงอายุ
            </label>

            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="mb-2 text-xs font-medium text-gray-500">ต่ำสุด</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="ปี"
                    value={minAgeYears}
                    onChange={(e) =>
                      handleFilterChange("minAgeYears", e.target.value)
                    }
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 outline-none"
                  />
                  <span className="text-xs text-gray-500">ปี</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    placeholder="เดือน"
                    value={minAge}
                    onChange={(e) => handleFilterChange("minAge", e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 outline-none"
                  />
                  <span className="text-xs text-gray-500">เดือน</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="mb-2 text-xs font-medium text-gray-500">สูงสุด</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="ปี"
                    value={maxAgeYears}
                    onChange={(e) =>
                      handleFilterChange("maxAgeYears", e.target.value)
                    }
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 outline-none"
                  />
                  <span className="text-xs text-gray-500">ปี</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    placeholder="เดือน"
                    value={maxAge}
                    onChange={(e) => handleFilterChange("maxAge", e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 outline-none"
                  />
                  <span className="text-xs text-gray-500">เดือน</span>
                </div>
              </div>
            </div>
          </div>

          {/* Child Height Growth Status filter, which is not necessary. AND NOT BEING USE NOW IN BUSINESS LOGIC*/}
          {/* <div className="space-y-1">
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
          </div> */}

          {/* Child Height Growth Status filter, which is not necessary. AND NOT BEING USE NOW IN BUSINESS LOGIC*/}
          {/* <div className="space-y-1">
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
          </div> */}

          <div className="flex gap-2 pt-2">
            <button
              onClick={clearFilters}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              ล้างตัวกรอง
            </button>
            <button
              onClick={applyAdvancedFilters}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              ใช้ตัวกรอง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
