"use client";

import { useActionState, useEffect } from "react";
import { createChildServerAction, ActionState } from "./actions";
import { Loader2, Save, UserPlus } from "lucide-react";
import { useMobilePageStore } from "@/stores/MobilePageStore";
import { EMobilePage } from "@/types/mobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    setSelectedTab(EMobilePage.CREATE_CHILD);
  }, [setSelectedTab]);

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
            </div>

            <div className="space-y-1.5 pt-1 focus-within:text-blue-600 transition-colors">
              <Label className="text-sm font-medium text-gray-700">
                วัน/เดือน/ปีเกิด (พ.ศ.)
              </Label>
              <div className="flex gap-2 w-full">
                <Input
                  name="birthDateDay"
                  placeholder="DD"
                  maxLength={2}
                  inputMode="numeric"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  className="w-[80px] rounded-xl h-12 text-center bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <span className="flex items-center justify-center text-gray-300 font-light text-xl">
                  /
                </span>
                <Input
                  name="birthDateMonth"
                  placeholder="MM"
                  maxLength={2}
                  inputMode="numeric"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  className="w-[80px] rounded-xl h-12 text-center bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <span className="flex items-center justify-center text-gray-300 font-light text-xl">
                  /
                </span>
                <Input
                  name="birthDateYear"
                  placeholder="YYYY"
                  maxLength={4}
                  inputMode="numeric"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  className="flex-1 rounded-xl h-12 text-center bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              {(state.errors?.birthDateDay ||
                state.errors?.birthDateMonth ||
                state.errors?.birthDateYear) && (
                <p className="text-xs text-red-500 mt-1">
                  กรุณาระบุ วัน/เดือน/ปีเกิด ให้ครบถ้วนและถูกต้อง (เช่น
                  15/05/2563)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                <Label
                  htmlFor="weight"
                  className="text-sm font-medium text-gray-700"
                >
                  น้ำหนักแรกเข้า (กก.)
                </Label>
                <div className="relative">
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="rounded-xl h-12 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                    kg
                  </span>
                </div>
                {state.errors?.weight && (
                  <p className="text-xs text-red-500 mt-1">
                    {state.errors.weight[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                <Label
                  htmlFor="height"
                  className="text-sm font-medium text-gray-700"
                >
                  ส่วนสูงแรกเข้า (ซม.)
                </Label>
                <div className="relative">
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="rounded-xl h-12 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                    cm
                  </span>
                </div>
                {state.errors?.height && (
                  <p className="text-xs text-red-500 mt-1">
                    {state.errors.height[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pt-1 focus-within:text-blue-600 transition-colors">
              <Label
                htmlFor="locationId"
                className="text-sm font-medium text-gray-700"
              >
                ศูนย์พัฒนาเด็กเล็ก
              </Label>
              {/* TODO: Fetch location data from API */}
              <select
                id="locationId"
                name="locationId"
                defaultValue=""
                className="w-full rounded-xl h-12 px-4 bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
              >
                <option value="" disabled>
                  เลือกศูนย์พัฒนาเด็กเล็ก
                </option>
                <option value="1">เขต 1</option>
                <option value="2">เขต 2</option>
              </select>
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
