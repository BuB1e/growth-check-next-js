"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Sparkles } from "lucide-react";
import { calculateAge, formatBE } from "@/lib/date-utils";
import { toast } from "sonner";

const measurementSchema = z.object({
  height: z.number().positive("ส่วนสูงต้องมากกว่า 0"),
  weight: z.number().positive("น้ำหนักต้องมากกว่า 0"),
  date: z.string().min(1, "กรุณาระบุวันที่"),
});

interface MeasurementDrawerProps {
  childId: number | null;
  locationId: number;
  birthDate: Date;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeasurementDrawer({
  childId,
  locationId,
  birthDate,
  userId,
  open,
  onOpenChange,
}: MeasurementDrawerProps) {
  const router = useRouter();
  const now = new Date();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const nowStr = formatBE(now, "dd-MM-yyyy");
  const [defaultDay, defaultMonth, defaultYear] = nowStr.split("-");

  const [day, setDay] = useState(defaultDay);
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [predictionMessage, setPredictionMessage] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const resetForm = () => {
    setHeight("");
    setWeight("");
    setDay(defaultDay);
    setMonth(defaultMonth);
    setYear(defaultYear);
    setErrors({});
    setSaveSuccess(false);
    setPredictionMessage(null);
    setPredictionError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsError(false);
    setPredictionMessage(null);
    setPredictionError(null);

    const adYear = parseInt(year) - 543;
    const dateStr = `${adYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    const parsed = measurementSchema.safeParse({
      height: parseFloat(height),
      weight: parseFloat(weight),
      date: dateStr,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsPending(true);
    try {
      const { createChildDataAction, createPredictionForChildAction } = await import(
        "@/app/mobile/staff/child/[child_id]/actions"
      );
      const { years: ageYear, months: ageMonth } = calculateAge(
        birthDate,
        new Date(parsed.data.date),
      );

      await createChildDataAction({
        childId: childId ?? 0,
        locationId,
        height: parsed.data.height,
        weight: parsed.data.weight,
        heightDate: new Date(parsed.data.date),
        ageYear,
        ageMonth,
        userCreated: userId,
        userUpdated: userId,
      });

      if (childId) {
        setIsPredicting(true);
        const predictionResult = await createPredictionForChildAction(childId, "lstm");
        if (predictionResult.success) {
          setPredictionMessage("บันทึกแล้วและส่งคำขอทำนายผล 6 เดือนเรียบร้อย");
          toast.success("บันทึกข้อมูลและส่งคำขอทำนายเรียบร้อยแล้ว");
        } else {
          setPredictionError(
            predictionResult.error ?? "บันทึกสำเร็จ แต่ไม่สามารถส่งคำขอทำนายได้",
          );
          toast.error(predictionResult.error ?? "บันทึกสำเร็จ แต่ไม่สามารถส่งคำขอทำนายได้");
        }
        setIsPredicting(false);
      } else {
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      }

      setSaveSuccess(true);
      router.refresh();
    } catch {
      setIsError(true);
      toast.error("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsPending(false);
      setIsPredicting(false);
    }
  };

  const handleCreatePrediction = async () => {
    if (!childId) {
      return;
    }

    setIsPredicting(true);
    setPredictionMessage(null);
    setPredictionError(null);

    try {
      const { createPredictionForChildAction } = await import(
        "@/app/mobile/staff/child/[child_id]/actions"
      );
      const result = await createPredictionForChildAction(childId, "lstm");

      if (!result.success) {
        setPredictionError(result.error ?? "ทำนายไม่สำเร็จ กรุณาลองใหม่");
        toast.error(result.error ?? "ทำนายไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      setPredictionMessage("ส่งคำขอทำนายแล้ว ระบบกำลังประมวลผล");
      toast.success("ส่งคำขอทำนายแล้ว ระบบกำลังประมวลผล");
      router.refresh();
    } catch {
      setPredictionError("ไม่สามารถทำนายได้ กรุณาลองใหม่อีกครั้ง");
      toast.error("ไม่สามารถทำนายได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>บันทึกข้อมูลการเจริญเติบโต</DrawerTitle>
            <DrawerDescription>
              กรอกข้อมูลส่วนสูงและน้ำหนักของเด็ก
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-4 px-4">
            {isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่
              </div>
            )}

            {saveSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                บันทึกข้อมูลเรียบร้อยแล้ว คุณสามารถทำนายการเจริญเติบโตต่อได้ทันที
              </div>
            )}

            {predictionMessage && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                {predictionMessage}
              </div>
            )}

            {predictionError && (
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                {predictionError}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-gray-700 font-medium">
                  ส่วนสูง (ซม.)
                </Label>
                <div className="relative">
                  <Input
                    id="height"
                    type="text"
                    inputMode="decimal"
                    placeholder="85.5"
                    value={height}
                    onChange={(e) =>
                      setHeight(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    className="min-h-13 bg-gray-50/50 pl-4 pr-12 text-lg rounded-xl focus-visible:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    cm
                  </span>
                </div>
                {errors.height && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.height}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-gray-700 font-medium">
                  น้ำหนัก (กก.)
                </Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="text"
                    inputMode="decimal"
                    placeholder="11.2"
                    value={weight}
                    onChange={(e) =>
                      setWeight(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    className="min-h-13 bg-gray-50/50 pl-4 pr-12 text-lg rounded-xl focus-visible:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    kg
                  </span>
                </div>
                {errors.weight && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.weight}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  วันที่วัด (วว/ดด/ปปปป - พ.ศ.)
                </Label>
                <div className="flex gap-2 w-full">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="DD"
                    value={day}
                    maxLength={2}
                    onChange={(e) =>
                      setDay(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="min-h-13 w-20 bg-gray-50/50 text-lg rounded-xl text-center focus-visible:ring-blue-500"
                  />
                  <span className="flex items-center justify-center text-gray-300 text-xl font-light">
                    /
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM"
                    value={month}
                    maxLength={2}
                    onChange={(e) =>
                      setMonth(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="min-h-13 w-20 bg-gray-50/50 text-lg rounded-xl text-center focus-visible:ring-blue-500"
                  />
                  <span className="flex items-center justify-center text-gray-300 text-xl font-light">
                    /
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY"
                    value={year}
                    maxLength={4}
                    onChange={(e) =>
                      setYear(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="min-h-13 flex-1 bg-gray-50/50 text-lg rounded-xl text-center focus-visible:ring-blue-500"
                  />
                </div>
                {errors.date && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.date}
                  </p>
                )}
              </div>
            </div>

            <DrawerFooter className="px-0 pt-4 pb-8">
              {!saveSuccess ? (
                <Button
                  type="submit"
                  className="min-h-13 w-full rounded-xl bg-blue-600 text-base font-semibold shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  บันทึก
                </Button>
              ) : (
                <Button
                  type="button"
                  className="min-h-13 w-full rounded-xl bg-sky-600 text-base font-semibold shadow-sm transition-all hover:bg-sky-700 active:scale-[0.98]"
                  onClick={handleCreatePrediction}
                  disabled={isPredicting}
                >
                  {isPredicting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  ทำนายผล 6 เดือน
                </Button>
              )}
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="min-h-12 w-full"
                  onClick={resetForm}
                >
                  ยกเลิก
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
