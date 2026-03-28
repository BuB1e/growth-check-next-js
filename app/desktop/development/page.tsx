import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DevelopmentAction } from "@/actions/DevelopmentAction";
import type { DevelopmentResponse } from "@/dto";
import { DevelopmentGrid } from "./DevelopmentGrid";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "คำแนะนำพัฒนาการ (Development Suggestions)",
  description: "จัดการและแก้ไขคำแนะนำพัฒนาการ",
};

interface PageProps {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  searchParams: Promise<{}>;
}

export default function DevelopmentPage({ searchParams }: PageProps) {
  // Using Promise.resolve just to consume the prop if needed by Next 15 router structure,
  // but we aren't using filters strictly for this MVP bulk-edit view right now.
  void searchParams;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">คำแนะนำพัฒนาการ</h1>
          <p className="text-muted-foreground mt-1">
            แก้ไขข้อความคำแนะนำพัฒนาการของเด็กตามช่วงอายุ (บันทึกอัตโนมัติเมื่อกด Enter หรือคลิกช่องอื่น)
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] border rounded-md shadow-sm bg-white overflow-hidden flex flex-col relative w-full">
        <Suspense fallback={<DevelopmentGridSkeleton />}>
          <DevelopmentDataWrapper />
        </Suspense>
      </div>
    </div>
  );
}

function DevelopmentGridSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse w-full h-full min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  );
}

async function DevelopmentDataWrapper() {
  let developments: DevelopmentResponse[] = [];

  try {
    // We intentionally fetch a large limit so we can treat it like a spreadsheet.
    // In strict production with tens of thousands, we'd need pagination. 
    // Here we assume ~100-200 development cases.
    const res = await DevelopmentAction.getDevelopments({
      page: 1,
      limit: 1000,
      deleteStatus: false,
    });
    developments = res.data;
  } catch (error) {
    console.error("Failed to load developments:", error);
    notFound();
  }

  // Sorting: By ID
  const sortedDevelopments = [...developments].sort((a, b) => a.id - b.id);

  return <DevelopmentGrid defaultDevelopments={sortedDevelopments} />;
}
