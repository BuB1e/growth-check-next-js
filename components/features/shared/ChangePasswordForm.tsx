"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Lock, Check } from "lucide-react";
import { toast } from "sonner";

// TODO: Adjust min-length to match backend password policy
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    newPassword: z
      .string()
      .min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร"),
    confirmPassword: z
      .string()
      .min(1, "กรุณายืนยันรหัสผ่านใหม่"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านใหม่ไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

/**
 * Client component for changing user password.
 * Uses react-hook-form + zod for validation with confirm-password matching.
 * Targets BetterAuth's change-password endpoint.
 */
export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (values: ChangePasswordValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await onSubmit({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        setSuccessMessage("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        form.reset();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch {
        setErrorMessage(
          "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองอีกครั้ง",
        );
        toast.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองอีกครั้ง");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5 text-blue-600" />
          เปลี่ยนรหัสผ่าน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    รหัสผ่านปัจจุบัน
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="กรอกรหัสผ่านปัจจุบัน"
                      className="h-11 text-base"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      รหัสผ่านใหม่
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                        className="h-11 text-base"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      ยืนยันรหัสผ่านใหม่
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                        className="h-11 text-base"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Feedback messages */}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <Check className="h-4 w-4" />
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="h-11 min-w-35 text-base"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังเปลี่ยน...
                  </>
                ) : (
                  "เปลี่ยนรหัสผ่าน"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
