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
    <div className="min-h-screen bg-surface-container-lowest pb-32">
      <div className="px-6 pt-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-display-lg font-bold text-on-surface tracking-tight">
            ลงทะเบียนเด็กใหม่
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            กรอกข้อมูลพื้นฐานและบันทึกการเจริญเติบโตเบื้องต้น เพื่อเริ่มการติดตามพัฒนาการ
          </p>
        </div>

        {state.message && (
          <div className="rounded-2xl bg-error-container p-4 border-0 shadow-sm animate-shake">
            <p className="text-body-md text-on-error-container font-bold">{state.message}</p>
          </div>
        )}

        <form action={formAction} className="space-y-10">
          {/* ข้อมูลพื้นฐาน */}
          <div className="bg-surface p-6 rounded-4xl shadow-[0_4px_32px_rgba(25,28,30,0.04)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            
            <div className="flex items-center gap-3 pb-2">
              <div className="bg-primary-fixed p-2.5 rounded-xl text-primary shadow-sm">
                <UserPlus className="size-6" />
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface">
                ข้อมูลพื้นฐาน
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2 group">
                <Label
                  htmlFor="firstName"
                  className="text-label-lg font-bold text-on-surface-variant group-focus-within:text-primary transition-colors"
                >
                  ชื่อจริง
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="เช่น สมชาย"
                  className="rounded-2xl h-14 bg-surface-container-low border-0 focus:bg-surface focus:ring-4 focus:ring-primary/10 text-body-lg transition-all"
                />
                {state.errors?.firstName && (
                  <p className="text-body-sm text-error font-bold mt-1">
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2 group">
                <Label
                  htmlFor="lastName"
                  className="text-label-lg font-bold text-on-surface-variant group-focus-within:text-primary transition-colors"
                >
                  นามสกุล
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="เช่น มีความสุข"
                  className="rounded-2xl h-14 bg-surface-container-low border-0 focus:bg-surface focus:ring-4 focus:ring-primary/10 text-body-lg transition-all"
                />
                {state.errors?.lastName && (
                  <p className="text-body-sm text-error font-bold mt-1">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <Label htmlFor="sex" className="text-label-lg font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">
                    เพศ
                  </Label>
                  <div className="relative">
                    <select
                      id="sex"
                      name="sex"
                      defaultValue=""
                      className="w-full rounded-2xl h-14 px-5 bg-surface-container-low border-0 text-on-surface text-body-lg focus:bg-surface focus:ring-4 focus:ring-primary/10 focus:outline-none appearance-none transition-all"
                    >
                      <option value="" disabled>เลือกเพศ</option>
                      <option value={Sex.MALE}>{SexToThai[Sex.MALE]}</option>
                      <option value={Sex.FEMALE}>{SexToThai[Sex.FEMALE]}</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  {state.errors?.sex && (
                    <p className="text-body-sm text-error font-bold mt-1">{state.errors.sex[0]}</p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="locationId"
                    className="text-label-lg font-bold text-on-surface-variant group-focus-within:text-primary transition-colors"
                  >
                    เขตพื้นที่
                  </Label>
                  <div className="relative">
                    <select
                      id="locationId"
                      name="locationId"
                      defaultValue=""
                      className="w-full rounded-2xl h-14 px-5 bg-surface-container-low border-0 text-on-surface text-body-lg focus:bg-surface focus:ring-4 focus:ring-primary/10 focus:outline-none appearance-none transition-all"
                    >
                      <option value="" disabled>
                        {isLoadingLocations ? "กำลังโหลด..." : "เลือกเขต"}
                      </option>
                      {!isLoadingLocations &&
                        locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 group">
                <Label className="text-label-lg font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">
                  วัน/เดือน/ปีเกิด (พ.ศ.)
                </Label>
                <div className="flex gap-3 items-center">
                  <Input
                    name="birthDateDay"
                    placeholder="วว"
                    maxLength={2}
                    className="w-full text-center h-14 rounded-2xl bg-surface-container-low border-0 focus:bg-surface focus:ring-4 focus:ring-primary/10 text-body-lg"
                  />
                  <span className="text-on-surface-variant text-headline-sm">/</span>
                  <Input
                    name="birthDateMonth"
                    placeholder="ดด"
                    maxLength={2}
                    className="w-full text-center h-14 rounded-2xl bg-surface-container-low border-0 focus:bg-surface focus:ring-4 focus:ring-primary/10 text-body-lg"
                  />
                  <span className="text-on-surface-variant text-headline-sm">/</span>
                  <Input
                    name="birthDateYear"
                    placeholder="ปปปป"
                    maxLength={4}
                    className="w-full text-center h-14 rounded-2xl bg-surface-container-low border-0 focus:bg-surface focus:ring-4 focus:ring-primary/10 text-body-lg"
                  />
                </div>
                {(state.errors?.birthDateDay || state.errors?.birthDateMonth || state.errors?.birthDateYear) && (
                  <p className="text-body-sm text-error font-bold mt-1">ข้อมูลวันที่ไม่ถูกต้อง</p>
                )}
              </div>
            </div>
          </div>

          {/* ข้อมูลการเจริญเติบโต */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-headline-md font-bold text-on-surface tracking-tight">บันทึกการวัด</h3>
              <Button
                type="button"
                variant="ghost"
                onClick={addMeasurement}
                className="text-primary font-bold text-body-lg hover:bg-primary-fixed/30 rounded-2xl px-4"
              >
                <Plus className="size-6 mr-2" />
                เพิ่มครั้งใหม่
              </Button>
            </div>

            <div className="space-y-6">
              {measurements.map((m, index) => (
                <div key={m.id} className="bg-surface p-7 rounded-4xl shadow-[0_4px_32px_rgba(25,28,30,0.04)] space-y-6 relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                     {measurements.length > 1 && (
                       <button
                         type="button"
                         onClick={() => removeMeasurement(m.id)}
                         className="size-10 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl transition-colors"
                       >
                         <Trash2 className="size-6" />
                       </button>
                     )}
                   </div>

                   <div className="flex items-center gap-4">
                      <span className="size-12 flex items-center justify-center bg-primary-fixed text-primary rounded-2xl text-headline-sm font-black">
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-label-lg font-bold text-on-surface-variant uppercase tracking-widest">การบันทึกครั้งที่</p>
                        <p className="text-headline-sm font-bold text-on-surface">ข้อมูลการเจริญเติบโต</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-label-lg font-bold text-on-surface-variant">น้ำหนัก (ก.ก.)</Label>
                         <div className="relative">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={m.weight}
                              onChange={(e) => updateMeasurement(m.id, "weight", e.target.value)}
                              className="h-16 rounded-2xl bg-surface-container-low border-0 focus:bg-surface focus:ring-4 focus:ring-primary/10 text-headline-sm font-bold text-on-surface pr-14 pl-5 transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-body-lg font-bold text-on-surface-variant">kg</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-label-lg font-bold text-on-surface-variant">ส่วนสูง (ซ.ม.)</Label>
                         <div className="relative">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={m.height}
                              onChange={(e) => updateMeasurement(m.id, "height", e.target.value)}
                              className="h-16 rounded-2xl bg-surface-container-low border-0 focus:bg-surface focus:ring-4 focus:ring-primary/10 text-headline-sm font-bold text-on-surface pr-14 pl-5 transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-body-lg font-bold text-on-surface-variant">cm</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-label-lg font-bold text-on-surface-variant">วันที่ทำการวัด</Label>
                      <div className="flex gap-3 items-center">
                         <Input
                           value={m.dateDay}
                           onChange={(e) => updateMeasurement(m.id, "dateDay", e.target.value)}
                           className="w-full text-center h-14 rounded-2xl bg-surface-container-low border-0 text-body-lg font-bold"
                         />
                         <span className="text-on-surface-variant text-headline-md">/</span>
                         <Input
                           value={m.dateMonth}
                           onChange={(e) => updateMeasurement(m.id, "dateMonth", e.target.value)}
                           className="w-full text-center h-14 rounded-2xl bg-surface-container-low border-0 text-body-lg font-bold"
                         />
                         <span className="text-on-surface-variant text-headline-md">/</span>
                         <Input
                           value={m.dateYear}
                           onChange={(e) => updateMeasurement(m.id, "dateYear", e.target.value)}
                           className="w-full text-center h-14 rounded-2xl bg-surface-container-low border-0 text-body-lg font-bold"
                         />
                      </div>
                   </div>
                </div>
              ))}
            </div>
            <input type="hidden" name="measurementsJSON" value={JSON.stringify(measurements)} />
          </div>

          <div className="pt-8">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-16 rounded-[1.25rem] text-headline-sm font-bold bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isPending ? (
                <Loader2 className="mr-3 size-6 animate-spin" />
              ) : (
                <Save className="mr-3 size-6" />
              )}
              ยืนยันการลงทะเบียน
            </Button>
            <p className="text-center text-body-md text-on-surface-variant mt-6 px-4 font-medium opacity-70">
              ข้อมูลจะถูกบันทึกเข้าระบบส่วนกลางทันที เพื่อการติดตามพัฒนาการในอนาคต
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
