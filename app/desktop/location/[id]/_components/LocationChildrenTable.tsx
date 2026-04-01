"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChildResponse, PaginatedResponseDTO } from "@/dto";
import { SexToThai, Sex } from "@/types";
import { formatBE } from "@/lib/date-utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { differenceInMonths } from "date-fns";

interface LocationChildrenTableProps {
  rawData: PaginatedResponseDTO<ChildResponse>;
}

export function LocationChildrenTable({ rawData }: LocationChildrenTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryMinAge = searchParams.get("minAge");
  const queryMaxAge = searchParams.get("maxAge");

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [minAgeYears, setMinAgeYears] = useState(
    queryMinAge ? String(Math.floor(Number(queryMinAge) / 12)) : "",
  );
  const [maxAgeYears, setMaxAgeYears] = useState(
    queryMaxAge ? String(Math.floor(Number(queryMaxAge) / 12)) : "",
  );
  const [haStatus, setHaStatus] = useState(searchParams.get("haStatus") || "all");
  const [waStatus, setWaStatus] = useState(searchParams.get("waStatus") || "all");
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (q) params.set("q", q); else params.delete("q");
    if (minAgeYears) {
      const minMonths = Math.max(0, (Number(minAgeYears) || 0) * 12);
      params.set("minAge", String(minMonths));
    } else {
      params.delete("minAge");
    }
    if (maxAgeYears) {
      const maxMonths = Math.max(0, (Number(maxAgeYears) || 0) * 12 + 11);
      params.set("maxAge", String(maxMonths));
    } else {
      params.delete("maxAge");
    }
    params.delete("minAgeYears");
    params.delete("maxAgeYears");
    if (haStatus !== "all") params.set("haStatus", haStatus); else params.delete("haStatus");
    if (waStatus !== "all") params.set("waStatus", waStatus); else params.delete("waStatus");

    params.set("tab", "children");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [q, minAgeYears, maxAgeYears, haStatus, waStatus, searchParams, pathname, router]);

  const clearFilters = () => {
    setQ("");
    setMinAgeYears("");
    setMaxAgeYears("");
    setHaStatus("all");
    setWaStatus("all");
    router.push(`${pathname}?tab=children`, { scroll: false });
  };

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: children, meta } = rawData;

  const getAgeLabel = (months: number) => {
    if (months < 12) return "เด็กทารก";
    if (months < 36) return "เด็กวัยหัดเดิน";
    if (months <= 60) return "เด็กวัยก่อนเรียน";
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
         <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อเด็ก..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-10 text-lg h-12 rounded-xl"
            />
         </div>
         <div className="flex gap-2">
            <Button
               variant={showFilters ? "secondary" : "outline"}
               onClick={() => setShowFilters(!showFilters)}
               className="h-12 px-5 rounded-xl gap-2 text-base"
            >
               <SlidersHorizontal className="h-5 w-5" />
               ตัวกรอง
               {(minAgeYears || maxAgeYears || haStatus !== "all" || waStatus !== "all") && (
                  <Badge variant="default" className="ml-1 px-1.5 h-5 min-w-5 justify-center">
                     {[minAgeYears, maxAgeYears, haStatus !== "all", waStatus !== "all"].filter(Boolean).length}
                  </Badge>
               )}
            </Button>
            <Button onClick={applyFilters} className="h-12 px-8 rounded-xl text-base font-bold">
               ค้นหา
            </Button>
         </div>
      </div>

      {showFilters && (
         <div className="p-6 rounded-2xl bg-muted/30 border space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">ช่วงอายุ (ปี) - ต่ำสุด</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minAgeYears}
                    onChange={(e) => setMinAgeYears(e.target.value)}
                    className="h-11 text-lg rounded-lg"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">ช่วงอายุ (ปี) - สูงสุด</label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={maxAgeYears}
                    onChange={(e) => setMaxAgeYears(e.target.value)}
                    className="h-11 text-lg rounded-lg"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">เกณฑ์ส่วนสูง (HA)</label>
                  <Select value={haStatus} onValueChange={setHaStatus}>
                     <SelectTrigger className="h-11 text-lg rounded-lg">
                        <SelectValue placeholder="ทั้งหมด" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="สูงกว่าเกณฑ์">สูงกว่าเกณฑ์</SelectItem>
                        <SelectItem value="ปกติ">ปกติ</SelectItem>
                        <SelectItem value="เริ่มเตี้ย">เริ่มเตี้ย</SelectItem>
                        <SelectItem value="เตี้ย">เตี้ย</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">เกณฑ์น้ำหนัก (WA)</label>
                  <Select value={waStatus} onValueChange={setWaStatus}>
                     <SelectTrigger className="h-11 text-lg rounded-lg">
                        <SelectValue placeholder="ทั้งหมด" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="น้ำหนักเกิน">น้ำหนักเกิน</SelectItem>
                        <SelectItem value="ปกติ">ปกติ</SelectItem>
                        <SelectItem value="เริ่มน้อยกว่าเกณฑ์">เริ่มน้อยกว่าเกณฑ์</SelectItem>
                        <SelectItem value="น้อยกว่าเกณฑ์">น้อยกว่าเกณฑ์</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
               <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground underline h-11 px-4">
                  ล้างตัวกรอง
               </Button>
               <Button onClick={() => { applyFilters(); setShowFilters(false); }} className="h-11 px-8 rounded-lg font-bold">
                  ตกลง
               </Button>
            </div>
         </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold text-base">ชื่อ-นามสกุล</TableHead>
              <TableHead className="font-bold text-base">เพศ</TableHead>
              <TableHead className="font-bold text-base text-center">อายุ</TableHead>
              <TableHead className="font-bold text-base text-center">HA Status</TableHead>
              <TableHead className="font-bold text-base text-center">WA Status</TableHead>
              <TableHead className="font-bold text-base text-right">อัปเดตล่าสุด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.length > 0 ? (
              children.map((child) => {
                const ageMonths = differenceInMonths(new Date(), new Date(child.birthDate));
                const ageLabel = getAgeLabel(ageMonths);

                return (
                  <TableRow
                    key={child.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/desktop/children/${child.id}`)}
                  >
                    <TableCell className="font-semibold text-lg py-4">
                      {child.firstName} {child.lastName}
                    </TableCell>
                    <TableCell className="text-base">
                      {SexToThai[child.sex as Sex] ?? child.sex}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium">
                          {Math.floor(ageMonths / 12)} ปี {ageMonths % 12} เดือน
                        </span>
                        {ageLabel && (
                          <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                            {ageLabel}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={child.haStatus} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={child.waStatus} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatBE(child.updatedAt, "d MMM yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-lg">
                  ไม่พบข้อมูลเด็กตามเงื่อนไขที่ระบุ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            ทั้งหมด {meta.total} คน
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePage(meta.page - 1)}
              disabled={meta.page <= 1}
              className="h-10 w-10 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-base font-medium mx-2">
              หน้า {meta.page} จาก {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="h-10 w-10 p-0 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let className = "";

  if (status === "ปกติ") {
    variant = "secondary";
    className = "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
  } else if (status.includes("สูง") || status.includes("มาก")) {
    variant = "secondary";
    className = "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
  } else if (status.includes("เตี้ย") || status.includes("น้อย")) {
    variant = "destructive";
    className = "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
  }

  return (
    <Badge variant={variant} className={`px-2.5 py-0.5 text-sm font-bold ${className}`}>
      {status}
    </Badge>
  );
}
