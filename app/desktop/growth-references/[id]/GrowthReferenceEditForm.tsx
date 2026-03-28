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

  // Form fields — pre-filled from server response
  const [name, setName] = useState(reference.name);
  const [weightMean, setWeightMean] = useState(String(reference.weightMean));
  const [weightSd, setWeightSd] = useState(String(reference.weightSd));
  const [heightMean, setHeightMean] = useState(String(reference.heightMean));
  const [heightSd, setHeightSd] = useState(String(reference.heightSd));
  const [minAge, setMinAge] = useState(String(reference.minAge));
  const [maxAge, setMaxAge] = useState(String(reference.maxAge));
  // TODO: bmiMean/bmiSd — send-only fields, not returned by backend yet, defaults to empty
  const [bmiMean, setBmiMean] = useState("");
  const [bmiSd, setBmiSd] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await updateGrowthReferenceAction(String(reference.id), {
      name,
      weightMean: parseFloat(weightMean),
      weightSd: parseFloat(weightSd),
      heightMean: parseFloat(heightMean),
      heightSd: parseFloat(heightSd),
      minAge: parseFloat(minAge),
      maxAge: parseFloat(maxAge),
      ...(bmiMean ? { bmiMean: parseFloat(bmiMean) } : {}),
      ...(bmiSd ? { bmiSd: parseFloat(bmiSd) } : {}),
    });

    setIsPending(false);
    if (result.success) {
      setSuccessMessage(result.message ?? "อัพเดทสำเร็จ");
    } else {
      setErrorMessage(result.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("ยืนยันการลบเกณฑ์มาตรฐานนี้?")) return;
    setIsDeleting(true);
    setErrorMessage(null);

    const result = await deleteGrowthReferenceAction(String(reference.id));

    if (result.success) {
      router.push("/desktop/growth-references");
      router.refresh();
    } else {
      setErrorMessage(result.message ?? "ไม่สามารถลบได้ กรุณาลองใหม่");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{reference.name}</CardTitle>
            <CardDescription className="flex gap-2 mt-1">
              <Badge variant={reference.sex === "MALE" ? "default" : "secondary"}>
                {SEX_LABELS[reference.sex] ?? reference.sex}
              </Badge>
              <Badge variant="outline">
                {METRIC_LABELS[reference.metric] ?? reference.metric}
              </Badge>
              <span className="text-xs text-muted-foreground">
                อายุ {reference.minAge}–{reference.maxAge} เดือน
              </span>
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || isPending}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">ลบ</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-5">
          {errorMessage && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
              {successMessage}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-gr-name">ชื่อเกณฑ์</Label>
            <Input
              id="edit-gr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Age range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gr-minAge">อายุต่ำสุด (เดือน)</Label>
              <Input
                id="edit-gr-minAge"
                type="number"
                min={0}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gr-maxAge">อายุสูงสุด (เดือน)</Label>
              <Input
                id="edit-gr-maxAge"
                type="number"
                min={0}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Weight stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gr-weightMean">Mean น้ำหนัก (กก.)</Label>
              <Input
                id="edit-gr-weightMean"
                type="number"
                step="0.01"
                min={0}
                value={weightMean}
                onChange={(e) => setWeightMean(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gr-weightSd">SD น้ำหนัก</Label>
              <Input
                id="edit-gr-weightSd"
                type="number"
                step="0.01"
                min={0}
                value={weightSd}
                onChange={(e) => setWeightSd(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Height stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gr-heightMean">Mean ส่วนสูง (ซม.)</Label>
              <Input
                id="edit-gr-heightMean"
                type="number"
                step="0.01"
                min={0}
                value={heightMean}
                onChange={(e) => setHeightMean(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gr-heightSd">SD ส่วนสูง</Label>
              <Input
                id="edit-gr-heightSd"
                type="number"
                step="0.01"
                min={0}
                value={heightSd}
                onChange={(e) => setHeightSd(e.target.value)}
                required
              />
            </div>
          </div>

          {/* BMI — send-only */}
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
            {/* TODO: Remove this note once backend GET response includes bmiMean/bmiSd */}
            BMI Mean/SD จะถูกบันทึก แต่ยังไม่แสดงจาก API (backend pending)
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gr-bmiMean">BMI Mean (ตัวเลือก)</Label>
              <Input
                id="edit-gr-bmiMean"
                type="number"
                step="0.01"
                min={0}
                placeholder="กรอกถ้าต้องการอัพเดท"
                value={bmiMean}
                onChange={(e) => setBmiMean(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gr-bmiSd">BMI SD (ตัวเลือก)</Label>
              <Input
                id="edit-gr-bmiSd"
                type="number"
                step="0.01"
                min={0}
                placeholder="กรอกถ้าต้องการอัพเดท"
                value={bmiSd}
                onChange={(e) => setBmiSd(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending || isDeleting}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              บันทึกการแก้ไข
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
