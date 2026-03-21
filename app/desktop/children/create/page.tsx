"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createChildServerAction,
  ActionState,
  getCreateChildLocationOptions,
} from "./actions";
import { Loader2, Save, UserPlus, Plus, Trash2, ChevronLeft } from "lucide-react";
import { Sex, SexToThai } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialState: ActionState = {
  errors: {},
  message: null,
  success: false,
};

export default function DesktopCreateChildPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createChildServerAction,
    initialState,
  );

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
    async function fetchLocations() {
      try {
        const data = await getCreateChildLocationOptions();
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations", error);
        setLocationLoadError("ไม่สามารถโหลดข้อมูลสถานที่ได้");
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchLocations();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/desktop/children">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">เพิ่มข้อมูลเด็ก</h2>
          <p className="text-muted-foreground mt-1">
            ลงทะเบียนข้อมูลส่วนตัวและบันทึกประวัติการเจริญเติบโตเริ่มต้น
          </p>
        </div>
      </div>

      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <UserPlus className="h-5 w-5" />
              </div>
              ข้อมูลเด็ก
            </CardTitle>
            <CardDescription>
              กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน ข้อมูลทั้งหมดจำเป็นสำหรับการติดตามพัฒนาการ
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 py-6">
            {state.message && (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <p className="text-sm text-red-600 font-medium">{state.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อจริง</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="ชื่อจริง"
                  className="h-10 border-gray-200"
                />
                {state.errors?.firstName && (
                  <p className="text-xs text-red-500">{state.errors.firstName[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="นามสกุล"
                  className="h-10 border-gray-200"
                />
                {state.errors?.lastName && (
                  <p className="text-xs text-red-500">{state.errors.lastName[0]}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sex">เพศ</Label>
                <select
                  id="sex"
                  name="sex"
                  defaultValue=""
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>เลือกเพศ</option>
                  <option value={Sex.MALE}>{SexToThai[Sex.MALE]}</option>
                  <option value={Sex.FEMALE}>{SexToThai[Sex.FEMALE]}</option>
                </select>
                {state.errors?.sex && (
                  <p className="text-xs text-red-500">{state.errors.sex[0]}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>วัน/เดือน/ปีเกิด (พ.ศ.)</Label>
                <div className="flex gap-2 max-w-sm items-center">
                  <Input
                    name="birthDateDay"
                    placeholder="วว"
                    maxLength={2}
                    inputMode="numeric"
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      const num = parseInt(cleaned, 10);
                      e.target.value = !cleaned ? "" : num > 31 ? "31" : cleaned;
                    }}
                    onBlur={(e) => {
                      let n = parseInt(e.target.value, 10);
                      if (isNaN(n) || n < 1) n = 1;
                      if (n > 31) n = 31;
                      e.target.value = n.toString().padStart(2, "0");
                    }}
                    className="w-20 text-center"
                  />
                  <span className="text-gray-400">/</span>
                  <Input
                    name="birthDateMonth"
                    placeholder="ดด"
                    maxLength={2}
                    inputMode="numeric"
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      const num = parseInt(cleaned, 10);
                      e.target.value = !cleaned ? "" : num > 12 ? "12" : cleaned;
                    }}
                    onBlur={(e) => {
                      let n = parseInt(e.target.value, 10);
                      if (isNaN(n) || n < 1) n = 1;
                      if (n > 12) n = 12;
                      e.target.value = n.toString().padStart(2, "0");
                    }}
                    className="w-20 text-center"
                  />
                  <span className="text-gray-400">/</span>
                  <Input
                    name="birthDateYear"
                    placeholder="ปปปป"
                    maxLength={4}
                    inputMode="numeric"
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      const num = parseInt(cleaned, 10);
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
                    className="flex-1 text-center"
                  />
                </div>
                {(state.errors?.birthDateDay ||
                  state.errors?.birthDateMonth ||
                  state.errors?.birthDateYear) && (
                  <p className="text-xs text-red-500">
                    กรุณาระบุ วัน/เดือน/ปีเกิด ให้ครบถ้วนและถูกต้อง (เช่น 15/05/2565)
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="locationId">ศูนย์พัฒนาเด็กเล็ก (สถานที่)</Label>
                <select
                  id="locationId"
                  name="locationId"
                  defaultValue=""
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    {isLoadingLocations ? "กำลังโหลด..." : "เลือกศูนย์พัฒนาเด็กเล็ก"}
                  </option>
                  {!isLoadingLocations &&
                    locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.district}, {loc.province})
                      </option>
                    ))}
                </select>
                {locationLoadError && <p className="text-xs text-red-500">{locationLoadError}</p>}
                {state.errors?.locationId && (
                  <p className="text-xs text-red-500">{state.errors.locationId[0]}</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">ข้อมูลการเจริญเติบโต</h3>
                  <p className="text-sm text-gray-500 border-none m-0 shadow-none">ประวัติการวัดน้ำหนักและส่วนสูงเบื้องต้น</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMeasurement}
                  className="h-9 px-4 hidden sm:flex"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มข้อมูลใหม่
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addMeasurement}
                  className="h-9 w-9 flex sm:hidden"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {measurements.map((m, index) => (
                  <div key={m.id} className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200/60 shadow-sm relative">
                    <div className="flex justify-between items-center mb-5 border-b border-gray-200 pb-2">
                      <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        ครั้งที่ {index + 1}
                      </span>
                      {measurements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeasurement(m.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          aria-label="ลบข้อมูล"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label>วันที่วัด (พ.ศ.)</Label>
                        <div className="flex gap-2 w-full items-center">
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
                            className="flex-1 h-10 text-center bg-white"
                          />
                          <span className="text-gray-400">/</span>
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
                            className="flex-1 h-10 text-center bg-white"
                          />
                          <span className="text-gray-400">/</span>
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
                            className="flex-1 h-10 text-center bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>น้ำหนัก (ก.ก.)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={m.weight}
                            onChange={(e) => updateMeasurement(m.id, "weight", e.target.value)}
                            className="h-10 pr-10 bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">kg</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>ส่วนสูง (ซ.ม.)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={m.height}
                            onChange={(e) => updateMeasurement(m.id, "height", e.target.value)}
                            className="h-10 pr-10 bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">cm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {state.errors?.measurementsJSON && (
                <p className="text-xs text-red-500 mt-2">{state.errors.measurementsJSON[0]}</p>
              )}
              <input type="hidden" name="measurementsJSON" value={JSON.stringify(measurements)} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-gray-50/50 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/desktop/children")}
              className="h-11 px-8"
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 font-medium text-base shadow-sm"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              บันทึกข้อมูลเด็กใหม่
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
