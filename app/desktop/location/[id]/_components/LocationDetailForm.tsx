"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { LocationResponse, UpdateLocationDTO } from "@/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLocationAction } from "@/app/desktop/location/actions";
import { toast } from "sonner";

const locationFormSchema = z.object({
  name: z.string().min(2, { message: "ชื่อชุมชนต้องมีอย่างน้อย 2 ตัวอักษร" }),
  map: z.string().min(2, { message: "กรุณาระบุแผนที่/จุดอ้างอิง" }),
  province: z.string().min(2, { message: "กรุณาระบุจังหวัด" }),
  district: z.string().min(2, { message: "กรุณาระบุอำเภอ" }),
  subDistrict: z.string().min(2, { message: "กรุณาระบุตำบล" }),
  zipCode: z
    .string()
    .regex(/^\d{5}$/, { message: "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" }),
});

type LocationFormValues = Required<
  Pick<
    UpdateLocationDTO,
    "name" | "map" | "province" | "district" | "subDistrict" | "zipCode"
  >
>;

interface LocationDetailFormProps {
  location: LocationResponse;
}

export function LocationDetailForm({ location }: LocationDetailFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: location.name,
      map: location.map,
      province: location.province,
      district: location.district,
      subDistrict: location.subDistrict,
      zipCode: location.zipCode,
    },
  });

  async function onSubmit(data: LocationFormValues) {
    startTransition(async () => {
      try {
        const payload: UpdateLocationDTO = data;
        const result = await updateLocationAction(location.id, payload);
        if (result.success) {
          toast.success("บันทึกข้อมูลชุมชนเรียบร้อยแล้ว");
          router.refresh();
        } else {
          toast.error(result.error ?? "บันทึกข้อมูลชุมชนไม่สำเร็จ");
        }
      } catch (error) {
        console.error("Failed to submit location update:", error);
        toast.error("บันทึกข้อมูลชุมชนไม่สำเร็จ กรุณาลองใหม่");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormItem>
            <FormLabel>รหัสชุมชน</FormLabel>
            <FormControl>
              <Input value={location.id.toString()} readOnly disabled />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>ผู้สร้างข้อมูล</FormLabel>
            <FormControl>
              <Input value={location.createdByUser || "-"} readOnly disabled />
            </FormControl>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อชุมชน</FormLabel>
              <FormControl>
                <Input placeholder="ระบุชื่อชุมชน" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="map"
          render={({ field }) => (
            <FormItem>
              <FormLabel>แผนที่ / จุดอ้างอิง</FormLabel>
              <FormControl>
                <Input placeholder="ระบุพิกัดหรือรายละเอียดจุดอ้างอิง" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จังหวัด</FormLabel>
                <FormControl>
                  <Input placeholder="จังหวัด" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>อำเภอ</FormLabel>
                <FormControl>
                  <Input placeholder="อำเภอ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subDistrict"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ตำบล</FormLabel>
                <FormControl>
                  <Input placeholder="ตำบล" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รหัสไปรษณีย์</FormLabel>
              <FormControl>
                <Input placeholder="รหัสไปรษณีย์ 5 หลัก" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก
              </>
            ) : (
              "บันทึกข้อมูล"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
