"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChildResponse } from "@/dto";
import { Button } from "@/components/ui/button";
import { updateChildAction } from "../../../app/desktop/children/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Minimal schema logic mapping the data points we want Head to securely edit
const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "ชื่อจริงต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  lastName: z.string().min(2, {
    message: "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  locationId: z.string().min(1, {
    message: "กรุณาระบุสถานที่/ชุมชน",
  }),
});

interface ChildProfileFormProps {
  child: ChildResponse;
}

export function ChildProfileForm({ child }: ChildProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: child.first_name,
      lastName: child.last_name,
      locationId: child.location_id.toString(),
    },
  });

  async function onSubmit(data: z.infer<typeof profileFormSchema>) {
    startTransition(async () => {
      try {
        await updateChildAction(child.id, {
          ...data,
          locationId: parseInt(data.locationId, 10),
        });
        // Refresh server components
        router.refresh();
      } catch (error) {
        console.error("Failed to update child profile:", error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อจริง</FormLabel>
              <FormControl>
                <Input placeholder="ระบุชื่อจริง" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>นามสกุล</FormLabel>
              <FormControl>
                <Input placeholder="ระบุนามสกุล" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชุมชน / สถานที่</FormLabel>
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกชุมชนที่เด็กอาศัยอยู่" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">ชุมชน A</SelectItem>
                  <SelectItem value="2">ชุมชน B</SelectItem>
                  <SelectItem value="3">ชุมชน C (อื่นๆ)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2 flex justify-end">
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
