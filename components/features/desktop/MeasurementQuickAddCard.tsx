"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBE } from "@/lib/date-utils";
import { createChildDataAction } from "@/app/desktop/children/actions";

const measurementSchema = z.object({
  height: z.number().positive("ส่วนสูงต้องมากกว่า 0"),
  weight: z.number().positive("น้ำหนักต้องมากกว่า 0"),
  date: z.string().min(1, "กรุณาระบุวันที่"),
});

interface MeasurementQuickAddCardProps {
  childId: number;
  locationId: number;
}

export function MeasurementQuickAddCard({
  childId,
  locationId,
}: MeasurementQuickAddCardProps) {
  const router = useRouter();
  const now = new Date();

  const nowStr = formatBE(now, "dd-MM-yyyy");
  const [defaultDay, defaultMonth, defaultYear] = nowStr.split("-");

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [day, setDay] = useState(defaultDay);
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const resetForm = () => {
    setHeight("");
    setWeight("");
    setDay(defaultDay);
    setMonth(defaultMonth);
    setYear(defaultYear);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsError(false);
    setSaveSuccess(false);

    const adYear = parseInt(year, 10) - 543;
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
    // TODO: Replace with backend-calculated development IDs and remove hardcoded 0 values.
    // TODO: Remove placeholder user fields once user identity comes from authenticated session only.
    // TODO: ageYear/ageMonth should be computed from child birthDate when passed as prop
    const result = await createChildDataAction({
      childId,
      locationId,
      height: parsed.data.height,
      weight: parsed.data.weight,
      heightDevelopmentId: 0,
      weightDevelopmentId: 0,
      heightDate: new Date(parsed.data.date),
      userCreated: "current-user",
      userUpdated: "current-user",
      age: 0,
    });

    if (!result.success) {
      setIsError(true);
      setIsPending(false);
      return;
    }

    setSaveSuccess(true);
    resetForm();
    router.refresh();
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isError && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          บันทึกข้อมูลล่าสุดเรียบร้อยแล้ว
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="desktop-height">ส่วนสูง (ซม.)</Label>
          <Input
            id="desktop-height"
            type="text"
            inputMode="decimal"
            placeholder="85.5"
            value={height}
            onChange={(e) => setHeight(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          {errors.height && <p className="text-xs text-red-500">{errors.height}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="desktop-weight">น้ำหนัก (กก.)</Label>
          <Input
            id="desktop-weight"
            type="text"
            inputMode="decimal"
            placeholder="11.2"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          {errors.weight && <p className="text-xs text-red-500">{errors.weight}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>วันที่วัด (วว/ดด/ปปปป - พ.ศ.)</Label>
        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="DD"
            value={day}
            maxLength={2}
            onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-20 text-center"
          />
          <span className="text-muted-foreground">/</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="MM"
            value={month}
            maxLength={2}
            onChange={(e) => setMonth(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-20 text-center"
          />
          <span className="text-muted-foreground">/</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="YYYY"
            value={year}
            maxLength={4}
            onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-28 text-center"
          />
        </div>
        {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          บันทึกข้อมูลล่าสุด
        </Button>

        <Button type="button" variant="outline" onClick={resetForm} disabled={isPending}>
          ล้างค่า
        </Button>
      </div>
    </form>
  );
}
