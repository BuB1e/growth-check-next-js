"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createChildServerAction,
  ActionState,
  getCreateChildLocationOptions,
} from "./actions";
import { Loader2, Save, UserPlus } from "lucide-react";
import { useMobilePageStore } from "@/stores/MobilePageStore";
import { EMobilePage, Sex, SexToThai } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const initialState: ActionState = {
  errors: {},
  message: null,
  success: false,
};

export default function CreateChildPage() {
  const [state, formAction, isPending] = useActionState(
    createChildServerAction,
    initialState,
  );

  const setSelectedTab = useMobilePageStore((state) => state.setSelectedTab);
  const [locations, setLocations] = useState<
    Array<{ id: number; name: string; district: string; province: string }>
  >([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationLoadError, setLocationLoadError] = useState<string | null>(
    null,
  );

  const [measurements, setMeasurements] = useState([
    {
      id: "1",
      dateDay: "",
      dateMonth: "",
      dateYear: "",
      weight: "",
      height: "",
    },
  ]);

  useEffect(() => {
    setMeasurements((prev) => {
      // Only set initial date if it hasn't been modified yet
      if (prev.length === 1 && prev[0].dateDay === "") {
        return [
          {
            ...prev[0],
            dateDay: new Date().getDate().toString().padStart(2, "0"),
            dateMonth: (new Date().getMonth() + 1).toString().padStart(2, "0"),
            dateYear: (new Date().getFullYear() + 543).toString(),
          },
        ];
      }
      return prev;
    });
  }, []);

  const addMeasurement = () => {
    setMeasurements([
      ...measurements,
      {
        id: Math.random().toString(36).substring(7),
        dateDay: new Date().getDate().toString().padStart(2, "0"),
        dateMonth: (new Date().getMonth() + 1).toString().padStart(2, "0"),
        dateYear: (new Date().getFullYear() + 543).toString(),
        weight: "",
        height: "",
      },
    ]);
  };

  const removeMeasurement = (id: string) => {
    if (measurements.length > 1) {
      setMeasurements(measurements.filter((m) => m.id !== id));
    }
  };

  const updateMeasurement = (id: string, field: string, value: string) => {
    setMeasurements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  useEffect(() => {
    setSelectedTab(EMobilePage.CREATE_CHILD);
  }, [setSelectedTab]);

  useEffect(() => {
    let mounted = true;

    const loadLocations = async () => {
      setIsLoadingLocations(true);
      setLocationLoadError(null);

      try {
        const result = await getCreateChildLocationOptions();
        if (!mounted) return;
        setLocations(result);
      } catch (error) {
        console.error("Failed to load location options:", error);
        if (!mounted) return;
        setLocationLoadError("ไม่สามารถโหลดข้อมูลเขตได้ กรุณาลองใหม่");
      } finally {
        if (mounted) {
          setIsLoadingLocations(false);
        }
      }
    };

    loadLocations();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-4">
        {state.message && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100">
            <p className="text-sm text-red-600 font-medium">{state.message}</p>
          </div>
        )}

        <form action={formAction} className="space-y-8">
          {/* ข้อมูลเด็ก */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">
                ข้อมูลเด็ก
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  ชื่อ
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="ชื่อจริง"
                  className="rounded-xl h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
                {state.errors?.firstName && (
                  <p className="text-xs text-red-500 mt-1">
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  นามสกุล
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="นามสกุล"
                  className="rounded-xl h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
                {state.errors?.lastName && (
                  <p className="text-xs text-red-500 mt-1">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                <Label htmlFor="sex" className="text-sm font-medium text-gray-700">
                  เพศ
                </Label>
                <select
                  id="sex"
                  name="sex"
                  defaultValue=""
                  className="w-full rounded-xl h-12 px-4 bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                >
                  <option value="" disabled>เลือกเพศ</option>
                  <option value={Sex.MALE}>{SexToThai[Sex.MALE]}</option>
                  <option value={Sex.FEMALE}>{SexToThai[Sex.FEMALE]}</option>
                </select>
                {state.errors?.sex && (
                  <p className="text-xs text-red-500 mt-1">{state.errors.sex[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pt-1 focus-within:text-blue-600 transition-colors">
              <Label className="text-sm font-medium text-gray-700">
                วัน/เดือน/ปีเกิด (พ.ศ.)
              </Label>
              <div className="flex gap-2 w-full">
                <Input
                  name="birthDateDay"
                  placeholder="วว"
                  maxLength={2}
                  inputMode="numeric"
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    const num = parseInt(cleaned, 10);
                    // Clamp day to max 31 while typing
                    e.target.value = !cleaned ? "" : num > 31 ? "31" : cleaned;
                  }}
                  onBlur={(e) => {
                    let n = parseInt(e.target.value, 10);
                    if (isNaN(n) || n < 1) n = 1;
                    if (n > 31) n = 31;
                    e.target.value = n.toString().padStart(2, "0");
                  }}
                  className="w-20 rounded-xl h-12 text-center bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <span className="flex items-center justify-center text-gray-300 font-light text-xl">
                  /
                </span>
                <Input
                  name="birthDateMonth"
                  placeholder="ดด"
                  maxLength={2}
                  inputMode="numeric"
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    const num = parseInt(cleaned, 10);
                    // Clamp month to max 12 while typing
                    e.target.value = !cleaned ? "" : num > 12 ? "12" : cleaned;
                  }}
                  onBlur={(e) => {
                    let n = parseInt(e.target.value, 10);
                    if (isNaN(n) || n < 1) n = 1;
                    if (n > 12) n = 12;
                    e.target.value = n.toString().padStart(2, "0");
                  }}
                  className="w-20 rounded-xl h-12 text-center bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <span className="flex items-center justify-center text-gray-300 font-light text-xl">
                  /
                </span>
                <Input
                  name="birthDateYear"
                  placeholder="ปปปป"
                  maxLength={4}
                  inputMode="numeric"
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    const num = parseInt(cleaned, 10);
                    // Clamp year to max current Buddhist Era year
                    const currentBEYear = new Date().getFullYear() + 543;
                    e.target.value = !cleaned ? "" : num > currentBEYear ? String(currentBEYear) : cleaned;
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) return;
                    let n = parseInt(e.target.value, 10);
                    const currentBEYear = new Date().getFullYear() + 543;
                    if (isNaN(n) || n < 1) n = 1;
                    if (n > currentBEYear) n = currentBEYear;
                    e.target.value = n.toString();
                  }}
                  className="flex-1 rounded-xl h-12 text-center bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              {(state.errors?.birthDateDay ||
                state.errors?.birthDateMonth ||
                state.errors?.birthDateYear) && (
                <p className="text-xs text-red-500 mt-1">
                  กรุณาระบุ วัน/เดือน/ปีเกิด ให้ครบถ้วนและถูกต้อง (เช่น
                  15/05/2565)
                </p>
              )}
              {state.errors?.measurementsJSON && (
                <p className="text-xs text-red-500 mt-1">
                  {state.errors.measurementsJSON[0]}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">ข้อมูลการเจริญเติบโต</h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={addMeasurement}
                  className="rounded-full h-10 px-4 text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  เพิ่มข้อมูล
                </Button>
              </div>

              {measurements.map((m, index) => (
                <div key={m.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
                  
                  {/* Card Header & Delete Button */}
                  <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                    <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                      ครั้งที่ {index + 1}
                    </span>
                    {measurements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMeasurement(m.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                        aria-label="ลบข้อมูล"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                      <Label className="text-sm font-medium text-gray-700">น้ำหนัก (ก.ก.)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={m.weight}
                          onChange={(e) => updateMeasurement(m.id, "weight", e.target.value)}
                          className="rounded-xl h-12 pr-10 bg-white border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                          kg
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                      <Label className="text-sm font-medium text-gray-700">ส่วนสูง (ซ.ม.)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={m.height}
                          onChange={(e) => updateMeasurement(m.id, "height", e.target.value)}
                          className="rounded-xl h-12 pr-10 bg-white border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                          cm
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                    <Label className="text-sm font-medium text-gray-700">วันที่วัด (พ.ศ.)</Label>
                    <div className="flex gap-2 w-full">
                      <Input
                        placeholder="วว"
                        maxLength={2}
                        inputMode="numeric"
                        value={m.dateDay}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, "");
                          const num = parseInt(cleaned, 10);
                          const val = !cleaned ? "" : num > 31 ? "31" : cleaned;
                          updateMeasurement(m.id, "dateDay", val);
                        }}
                        onBlur={(e) => {
                          let n = parseInt(e.target.value, 10);
                          if (isNaN(n) || n < 1) n = 1;
                          if (n > 31) n = 31;
                          updateMeasurement(m.id, "dateDay", n.toString().padStart(2, "0"));
                        }}
                        className="w-20 rounded-xl h-12 text-center bg-white border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                      <span className="flex items-center justify-center text-gray-300 font-light text-xl">
                        /
                      </span>
                      <Input
                        placeholder="ดด"
                        maxLength={2}
                        inputMode="numeric"
                        value={m.dateMonth}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, "");
                          const num = parseInt(cleaned, 10);
                          const val = !cleaned ? "" : num > 12 ? "12" : cleaned;
                          updateMeasurement(m.id, "dateMonth", val);
                        }}
                        onBlur={(e) => {
                          let n = parseInt(e.target.value, 10);
                          if (isNaN(n) || n < 1) n = 1;
                          if (n > 12) n = 12;
                          updateMeasurement(m.id, "dateMonth", n.toString().padStart(2, "0"));
                        }}
                        className="w-20 rounded-xl h-12 text-center bg-white border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                      <span className="flex items-center justify-center text-gray-300 font-light text-xl">
                        /
                      </span>
                      <Input
                        placeholder="ปปปป"
                        maxLength={4}
                        inputMode="numeric"
                        value={m.dateYear}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, "");
                          const num = parseInt(cleaned, 10);
                          const currentBEYear = new Date().getFullYear() + 543;
                          const val = !cleaned ? "" : num > currentBEYear ? String(currentBEYear) : cleaned;
                          updateMeasurement(m.id, "dateYear", val);
                        }}
                        onBlur={(e) => {
                          if (!e.target.value) return;
                          let n = parseInt(e.target.value, 10);
                          const currentBEYear = new Date().getFullYear() + 543;
                          if (isNaN(n) || n < 1) n = 1;
                          if (n > currentBEYear) n = currentBEYear;
                          updateMeasurement(m.id, "dateYear", n.toString());
                        }}
                        className="flex-1 rounded-xl h-12 text-center bg-white border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <input type="hidden" name="measurementsJSON" value={JSON.stringify(measurements)} />
            </div>

            <div className="space-y-1.5 pt-1 focus-within:text-blue-600 transition-colors">
              <Label
                htmlFor="locationId"
                className="text-sm font-medium text-gray-700"
              >
                เขต
              </Label>
              <select
                id="locationId"
                name="locationId"
                defaultValue=""
                className="w-full rounded-xl h-12 px-4 bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
              >
                <option value="" disabled>
                  {isLoadingLocations ? "กำลังโหลดข้อมูลเขต..." : "เลือกเขต"}
                </option>
                {!isLoadingLocations &&
                  locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.district}, {location.province})
                    </option>
                  ))}
              </select>
              {locationLoadError && (
                <p className="text-xs text-red-500 mt-1">{locationLoadError}</p>
              )}
              {state.errors?.locationId && (
                <p className="text-xs text-red-500 mt-1">
                  {state.errors.locationId[0]}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              บันทึกข้อมูลเด็กใหม่
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3 font-medium px-4">
              กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนกดยืนยัน
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
