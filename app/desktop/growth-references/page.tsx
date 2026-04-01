import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GrowthReferenceAction } from "@/actions/GrowthReferenceAction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { GrowthReferenceResponse } from "@/dto";
import { Sex, Metric_type } from "@/types";

export const metadata = {
  title: "เกณฑ์มาตรฐานการเจริญเติบโต",
  description: "จัดการข้อมูลเกณฑ์มาตรฐานการเจริญเติบโตของเด็ก",
};

interface PageProps {
  searchParams: Promise<{ page?: string; sex?: string; metric?: string; q?: string }>;
}

export default function GrowthReferencesPage({ searchParams }: PageProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">เกณฑ์มาตรฐานการเจริญเติบโต</h1>
          <p className="text-muted-foreground mt-1">
            จัดการข้อมูลเกณฑ์อ้างอิงสำหรับประเมินการเจริญเติบโต
          </p>
        </div>
      </div>

      <Suspense fallback={<GrowthReferenceTableSkeleton />}>
        <GrowthReferenceTableContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function GrowthReferenceTableSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  );
}

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

async function GrowthReferenceTableContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  let references: GrowthReferenceResponse[] = [];
  let totalPages = 1;

  try {
    const res = await GrowthReferenceAction.getGrowthReferences({
      page,
      limit: 20,
      ...(params.sex ? { sex: params.sex as Sex } : {}),
      ...(params.metric ? { metric: params.metric as Metric_type } : {}),
      ...(params.q ? { q: params.q } : {}),
      deleteStatus: false,
    });
    references = res.data;
    totalPages = res.meta.totalPages;
  } catch (error) {
    console.error("Failed to load growth references:", error);
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการเกณฑ์มาตรฐาน</CardTitle>
        <CardDescription>
          ทั้งหมด {references.length} รายการในหน้า {page} / {totalPages}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {references.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            ไม่พบข้อมูลเกณฑ์มาตรฐาน
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>เพศ</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">ช่วงอายุ (เดือน)</TableHead>
                  <TableHead className="text-right">Mean น้ำหนัก</TableHead>
                  <TableHead className="text-right">SD น้ำหนัก</TableHead>
                  <TableHead className="text-right">Mean ส่วนสูง</TableHead>
                  <TableHead className="text-right">SD ส่วนสูง</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {references.map((ref) => (
                  <TableRow key={ref.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="p-0">
                      <Link
                        href={`/desktop/growth-references/${ref.id}`}
                        className="block px-4 py-3 font-medium"
                      >
                        {ref.name}
                      </Link>
                    </TableCell>
                    <TableCell className="p-0">
                      <Link href={`/desktop/growth-references/${ref.id}`} className="block px-4 py-3">
                        <Badge variant={ref.sex === "MALE" ? "default" : "secondary"}>
                          {SEX_LABELS[ref.sex] ?? ref.sex}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="p-0">
                      <Link href={`/desktop/growth-references/${ref.id}`} className="block px-4 py-3">
                        <Badge variant="outline">{METRIC_LABELS[ref.metric] ?? ref.metric}</Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="p-0 text-right">
                      <Link href={`/desktop/growth-references/${ref.id}`} className="block px-4 py-3">
                        {ref.minAge} – {ref.maxAge}
                      </Link>
                    </TableCell>
                    <TableCell className="p-0 text-right">
                      <Link href={`/desktop/growth-references/${ref.id}`} className="block px-4 py-3">
                        {ref.weightMean.toFixed(2)}
                      </Link>
                    </TableCell>
                    <TableCell className="p-0 text-right">
                      <Link href={`/desktop/growth-references/${ref.id}`} className="block px-4 py-3">
                        {ref.weightSd.toFixed(2)}
                      </Link>
                    </TableCell>
                    <TableCell className="p-0 text-right">
                      <Link href={`/desktop/growth-references/${ref.id}`} className="block px-4 py-3">
                        {ref.heightMean.toFixed(2)}
                      </Link>
                    </TableCell>
                    <TableCell className="p-0 text-right">
                      <Link href={`/desktop/growth-references/${ref.id}`} className="block px-4 py-3">
                        {ref.heightSd.toFixed(2)}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page - 1}`}>ก่อนหน้า</Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              หน้า {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page + 1}`}>ถัดไป</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
