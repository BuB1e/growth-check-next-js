import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocationAction } from "@/actions/LocationAction";
import { LocationDetailForm } from "@/components/features/desktop/LocationDetailForm";
import { formatBE } from "@/lib/date-utils";

export const metadata = {
  title: "รายละเอียดชุมชน",
};

export default function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-4 flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/location">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">กลับไปหน้ารายการชุมชน</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">รายละเอียดชุมชน</h2>
          <p className="text-muted-foreground mt-1">
            แก้ไขข้อมูลชื่อชุมชน ที่อยู่ และข้อมูลแผนที่
          </p>
        </div>
      </div>

      <Suspense fallback={<DetailLoadingSkeleton />}>
        <LocationDetailContent params={params} />
      </Suspense>
    </div>
  );
}

function DetailLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูลชุมชน...</p>
    </div>
  );
}

async function LocationDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || Number.isNaN(Number(id))) {
    notFound();
  }

  const location = await LocationAction.getLocationById(id);

  if (!location) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลชุมชน</CardTitle>
          <CardDescription>
            {location.name} • สร้างเมื่อ {formatBE(location.createdAt, "d MMM yy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationDetailForm location={location} />
        </CardContent>
      </Card>
    </div>
  );
}
