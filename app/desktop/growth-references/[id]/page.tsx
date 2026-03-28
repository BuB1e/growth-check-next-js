import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrowthReferenceAction } from "@/actions/GrowthReferenceAction";
import type { GrowthReferenceResponse } from "@/dto";
import { GrowthReferenceEditForm } from "./GrowthReferenceEditForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `แก้ไขเกณฑ์มาตรฐาน #${id}` };
}

export default function GrowthReferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
          <h1 className="text-3xl font-bold tracking-tight">แก้ไขเกณฑ์มาตรฐาน</h1>
          <p className="text-muted-foreground mt-1">แก้ไขข้อมูลเกณฑ์อ้างอิงการเจริญเติบโต</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        }
      >
        <GrowthReferenceDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function GrowthReferenceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let reference: GrowthReferenceResponse;

  try {
    reference = await GrowthReferenceAction.getGrowthReferenceById(id);
  } catch {
    notFound();
  }

  return <GrowthReferenceEditForm reference={reference} />;
}
