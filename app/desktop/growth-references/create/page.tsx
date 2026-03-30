"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createGrowthReferenceAction } from "../actions";
import { Sex, Metric_type } from "@/types";

export default function CreateGrowthReferencePage() {
  const [state, formAction, isPending] = useActionState(createGrowthReferenceAction, null);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/desktop/growth-references">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">กลับ</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">เพิ่มเกณฑ์มาตรฐาน</h1>
          <p className="text-muted-foreground mt-1">กรอกข้อมูลเกณฑ์การเจริญเติบโตใหม่</p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>ข้อมูลเกณฑ์มาตรฐาน</CardTitle>
          <CardDescription>
            กรอกข้อมูลให้ครบถ้วน — bmiMean และ bmiSd เป็นตัวเลือก
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state?.message && !state.success && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {state.message}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="gr-name">ชื่อเกณฑ์</Label>
              <Input id="gr-name" name="name" placeholder="เช่น WHO 2006 เด็กชาย WA" />
              {state?.errors?.name && (
                <p className="text-xs text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Sex + Metric */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gr-sex">เพศ</Label>
                <Select name="sex">
                  <SelectTrigger id="gr-sex">
                    <SelectValue placeholder="เลือกเพศ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Sex.MALE}>ชาย</SelectItem>
                    <SelectItem value={Sex.FEMALE}>หญิง</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.sex && (
                  <p className="text-xs text-red-500">{state.errors.sex[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gr-metric">Metric</Label>
                <Select name="metric">
                  <SelectTrigger id="gr-metric">
                    <SelectValue placeholder="เลือก Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Metric_type.WA}>น้ำหนักตามอายุ (WA)</SelectItem>
                    <SelectItem value={Metric_type.HA}>ส่วนสูงตามอายุ (HA)</SelectItem>
                    <SelectItem value={Metric_type.BMI}>BMI</SelectItem>
                    <SelectItem value={Metric_type.WH}>น้ำหนักตามส่วนสูง (WH)</SelectItem>
                    <SelectItem value={Metric_type.WL}>น้ำหนักตามความยาว (WL)</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.metric && (
                  <p className="text-xs text-red-500">{state.errors.metric[0]}</p>
                )}
              </div>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gr-minAge">อายุต่ำสุด (เดือน)</Label>
                <Input id="gr-minAge" name="minAge" type="number" min={0} placeholder="0" />
                {state?.errors?.minAge && (
                  <p className="text-xs text-red-500">{state.errors.minAge[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gr-maxAge">อายุสูงสุด (เดือน)</Label>
                <Input id="gr-maxAge" name="maxAge" type="number" min={0} placeholder="60" />
                {state?.errors?.maxAge && (
                  <p className="text-xs text-red-500">{state.errors.maxAge[0]}</p>
                )}
              </div>
            </div>

            {/* Weight Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gr-weightMean">Mean น้ำหนัก (กก.)</Label>
                <Input id="gr-weightMean" name="weightMean" type="number" step="0.01" min={0} placeholder="15.50" />
                {state?.errors?.weightMean && (
                  <p className="text-xs text-red-500">{state.errors.weightMean[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gr-weightSd">SD น้ำหนัก</Label>
                <Input id="gr-weightSd" name="weightSd" type="number" step="0.01" min={0} placeholder="1.50" />
                {state?.errors?.weightSd && (
                  <p className="text-xs text-red-500">{state.errors.weightSd[0]}</p>
                )}
              </div>
            </div>

            {/* Height Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gr-heightMean">Mean ส่วนสูง (ซม.)</Label>
                <Input id="gr-heightMean" name="heightMean" type="number" step="0.01" min={0} placeholder="90.50" />
                {state?.errors?.heightMean && (
                  <p className="text-xs text-red-500">{state.errors.heightMean[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gr-heightSd">SD ส่วนสูง</Label>
                <Input id="gr-heightSd" name="heightSd" type="number" step="0.01" min={0} placeholder="3.20" />
                {state?.errors?.heightSd && (
                  <p className="text-xs text-red-500">{state.errors.heightSd[0]}</p>
                )}
              </div>
            </div>

            {/* BMI Stats — send-only, not returned by GET response yet */}
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
              {/* TODO: bmiMean/bmiSd will be visible in responses once backend mapper is updated */}
              ข้อมูล BMI Mean/SD จะถูกบันทึก แต่ยังไม่แสดงในการเรียกข้อมูล (backend pending)
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gr-bmiMean">BMI Mean (ตัวเลือก)</Label>
                <Input id="gr-bmiMean" name="bmiMean" type="number" step="0.01" min={0} placeholder="16.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gr-bmiSd">BMI SD (ตัวเลือก)</Label>
                <Input id="gr-bmiSd" name="bmiSd" type="number" step="0.01" min={0} placeholder="1.20" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                บันทึกเกณฑ์
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/desktop/growth-references">ยกเลิก</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
