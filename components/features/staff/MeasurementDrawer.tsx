"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
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
  const queryClient = useQueryClient();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (data: {
      height: number;
      weight: number;
      date: string;
    }) => {
      const res = await apiClient.post(
        `/children/${childId}/measurements`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      resetForm();
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setHeight("");
    setWeight("");
    setDate(new Date().toISOString().split("T")[0]);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = measurementSchema.safeParse({
      height: parseFloat(height),
      weight: parseFloat(weight),
      date,
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

    mutation.mutate(parsed.data);
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
            {mutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="height">ส่วนสูง (ซม.)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                placeholder="85.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="min-h-[48px] text-lg"
              />
              {errors.height && (
                <p className="text-sm text-red-500">{errors.height}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">น้ำหนัก (กก.)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="11.2"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="min-h-[48px] text-lg"
              />
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">วันที่วัด</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-[48px] text-lg"
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <DrawerFooter className="px-0">
              <Button
                type="submit"
                className="min-h-[48px] w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
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
