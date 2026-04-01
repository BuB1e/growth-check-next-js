"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Trash2 } from "lucide-react";
import type { GrowthReferenceResponse } from "@/dto";
import { updateGrowthReferenceAction, deleteGrowthReferenceAction } from "../actions";
import { Sex, Metric_type } from "@/types";
import { toast } from "sonner";

const SEX_LABELS: Record<Sex, string> = {
  MALE: "ชาย",
  FEMALE: "หญิง",
};

const METRIC_LABELS: Record<Metric_type, string> = {
  WA: "น้ำหนักตามอายุ (WA)",
  HA: "ส่วนสูงตามอายุ (HA)",
  BMI: "BMI",
  WH: "น้ำหนักตามส่วนสูง (WH)",
  WL: "น้ำหนักตามความยาว (WL)",
};

interface GrowthReferenceEditFormProps {
  reference: GrowthReferenceResponse;
}

export function GrowthReferenceEditForm({ reference }: GrowthReferenceEditFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields — only the 4 editable fields
  const [weightMean, setWeightMean] = useState(String(reference.weightMean));
  const [weightSd, setWeightSd] = useState(String(reference.weightSd));
  const [heightMean, setHeightMean] = useState(String(reference.heightMean));
  const [heightSd, setHeightSd] = useState(String(reference.heightSd));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Only send the fields that are meant to be updated
    const result = await updateGrowthReferenceAction(String(reference.id), {
      weightMean: parseFloat(weightMean),
      weightSd: parseFloat(weightSd),
      heightMean: parseFloat(heightMean),
      heightSd: parseFloat(heightSd),
    });

    setIsPending(false);
    if (result.success) {
      setSuccessMessage(result.message ?? "อัพเดทสำเร็จ");
      toast.success(result.message ?? "อัปเดตเกณฑ์เรียบร้อยแล้ว");
    } else {
      setErrorMessage(result.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      toast.error(result.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("ยืนยันการลบเกณฑ์มาตรฐานนี้?")) return;
    setIsDeleting(true);
    setErrorMessage(null);

    const result = await deleteGrowthReferenceAction(String(reference.id));

    if (result.success) {
      toast.success("ลบเกณฑ์มาตรฐานเรียบร้อยแล้ว");
      router.push("/desktop/growth-references");
      router.refresh();
    } else {
      setErrorMessage(result.message ?? "ไม่สามารถลบได้ กรุณาลองใหม่");
      toast.error(result.message ?? "ไม่สามารถลบได้ กรุณาลองใหม่");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Read-Only Information Section */}
      <Card className="bg-surface-container-low border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <span>ข้อมูลพื้นฐาน (อ่านอย่างเดียว)</span>
          </CardTitle>
          <CardDescription>
            ข้อมูลพื้นฐานของเกณฑ์มาตรฐานนี้ไม่สามารถแก้ไขได้จากหน้านี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">ชื่อเกณฑ์</p>
              <p className="text-body-lg font-semibold">{reference.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">เพศ / ประเภท</p>
              <div className="flex gap-2">
                <Badge variant={reference.sex === "MALE" ? "default" : "secondary"}>
                  {SEX_LABELS[reference.sex] ?? reference.sex}
                </Badge>
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-medium">
                  {METRIC_LABELS[reference.metric] ?? reference.metric}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">ช่วงอายุ</p>
              <p className="text-body-lg font-semibold text-primary">{reference.minAge} – {reference.maxAge} <span className="text-xs font-normal text-on-surface-variant">เดือน</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Parameters Form */}
      <Card className="border-none shadow-sm shadow-blue-500/5">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">แก้ไขค่าเกณฑ์การเจริญเติบโต</CardTitle>
          <CardDescription>
            กรอกข้อมูลค่าเฉลี่ย (Mean) และค่าเบี่ยงเบนมาตรฐาน (SD) ที่ต้องการปรับปรุง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-8">
            {errorMessage && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-100 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Weight stats section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
                  <div className="h-8 w-1 rounded-full bg-orange-400" />
                  <h4 className="font-bold text-orange-900 uppercase tracking-wide">สถิติน้ำหนัก (กก.)</h4>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="edit-gr-weightMean" className="text-sm font-semibold text-slate-700 ml-1">Mean น้ำหนัก</Label>
                    <Input
                      id="edit-gr-weightMean"
                      type="number"
                      step="0.01"
                      min={0}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium rounded-xl"
                      value={weightMean}
                      onChange={(e) => setWeightMean(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="edit-gr-weightSd" className="text-sm font-semibold text-slate-700 ml-1">SD น้ำหนัก</Label>
                    <Input
                      id="edit-gr-weightSd"
                      type="number"
                      step="0.01"
                      min={0}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium rounded-xl"
                      value={weightSd}
                      onChange={(e) => setWeightSd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Height stats section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                  <div className="h-8 w-1 rounded-full bg-blue-400" />
                  <h4 className="font-bold text-blue-900 uppercase tracking-wide">สถิติส่วนสูง (ซม.)</h4>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="edit-gr-heightMean" className="text-sm font-semibold text-slate-700 ml-1">Mean ส่วนสูง</Label>
                    <Input
                      id="edit-gr-heightMean"
                      type="number"
                      step="0.01"
                      min={0}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium rounded-xl"
                      value={heightMean}
                      onChange={(e) => setHeightMean(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="edit-gr-heightSd" className="text-sm font-semibold text-slate-700 ml-1">SD ส่วนสูง</Label>
                    <Input
                      id="edit-gr-heightSd"
                      type="number"
                      step="0.01"
                      min={0}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium rounded-xl"
                      value={heightSd}
                      onChange={(e) => setHeightSd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
               <Button
                type="submit"
                disabled={isPending || isDeleting}
                className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-bold text-base"
              >
                {isPending ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-3 h-5 w-5" />
                )}
                บันทึกการแก้ไขข้อมูล
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
