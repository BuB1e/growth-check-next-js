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
import { Loader2, Save } from "lucide-react";

const measurementSchema = z.object({
  height: z.number().positive("ส่วนสูงต้องมากกว่า 0"),
  weight: z.number().positive("น้ำหนักต้องมากกว่า 0"),
  date: z.string().min(1, "กรุณาระบุวันที่"),
});

interface MeasurementDrawerProps {
  childId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeasurementDrawer({
  childId,
  open,
  onOpenChange,
}: MeasurementDrawerProps) {
  const router = useRouter();
  const now = new Date();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [day, setDay] = useState(now.getDate().toString().padStart(2, "0"));
  const [month, setMonth] = useState(
    (now.getMonth() + 1).toString().padStart(2, "0"),
  );
  const [year, setYear] = useState((now.getFullYear() + 543).toString());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  const resetForm = () => {
    setHeight("");
    setWeight("");
    setDay(now.getDate().toString().padStart(2, "0"));
    setMonth((now.getMonth() + 1).toString().padStart(2, "0"));
    setYear((now.getFullYear() + 543).toString());
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsError(false);

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
      // TODO: replace with real api action mapping measurement parsed.data
      await new Promise((resolve) => setTimeout(resolve, 800));
      resetForm();
      onOpenChange(false);
      router.refresh();
    } catch {
      setIsError(true);
    } finally {
      setIsPending(false);
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
                    className="min-h-[52px] text-lg rounded-xl pl-4 pr-12 focus-visible:ring-blue-500 bg-gray-50/50"
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
                    className="min-h-[52px] text-lg rounded-xl pl-4 pr-12 focus-visible:ring-blue-500 bg-gray-50/50"
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
                    className="min-h-[52px] w-[80px] text-lg rounded-xl text-center focus-visible:ring-blue-500 bg-gray-50/50"
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
                    className="min-h-[52px] w-[80px] text-lg rounded-xl text-center focus-visible:ring-blue-500 bg-gray-50/50"
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
                    className="min-h-[52px] flex-1 text-lg rounded-xl text-center focus-visible:ring-blue-500 bg-gray-50/50"
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
              <Button
                type="submit"
                className="min-h-[52px] w-full rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                บันทึก
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="min-h-[48px] w-full">
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
