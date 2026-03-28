import { Suspense } from "react";
import { AiPredictionAction } from "@/actions/AiPredictionAction";
import { ChildAction } from "@/actions/ChildAction";
import { ChildDataAction } from "@/actions/ChildDataAction";
import { DevelopmentAction } from "@/actions/DevelopmentAction";
import { ChildDetailTabs } from "@/components/features/mobile/ChildDetailTabs";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { AiPredictionResponse } from "@/dto";
import { getCurrentSession } from "@/lib/auth/session.server";

async function ChildProfileContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ child_id: string }>;
}) {
  const p = await paramsPromise;
  const childId = parseInt(p.child_id.replace("child_", ""), 10);

  if (isNaN(childId)) {
    notFound();
  }

  const [child, childDataResponse, developmentsResponse] = await Promise.all([
    ChildAction.getChildById(p.child_id.replace("child_", "")),
    // Replace with real API call filtered by childId
    ChildDataAction.getChildDataList({ childId: childId }),
    DevelopmentAction.getDevelopments({ page: 1, limit: 2000 }),
  ]);

  let latestPrediction: AiPredictionResponse | null = null;
  try {
    const predictionRes = await AiPredictionAction.getPredictions({
      childId,
      page: 1,
      limit: 10,
    });

    latestPrediction =
      [...predictionRes.data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0] ?? null;
  } catch (error) {
    console.error("Failed to load mobile predictions:", error);
  }

  const history = childDataResponse || [];

  if (!child) {
    notFound();
  }

  const session = await getCurrentSession();
  const userId = session?.user.id;

  return (
    <ChildDetailTabs
      child={child}
      history={history}
      latestPrediction={latestPrediction}
      developments={developmentsResponse.data}
      userId={userId!}
    />
  );
}

export default function ChildProfilePage({
  params,
}: {
  params: Promise<{ child_id: string }>;
}) {
  return (
    <div className="bg-white min-h-screen">
      <div className="pt-2 px-4 pb-2 bg-linear-to-b from-blue-50/50 to-white/0 border-b border-gray-100/50">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 pb-1">
          แฟ้มประวัติ
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          ตรวจสอบข้อมูลส่วนบุคคล และพัฒนาการ
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-10 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        }
      >
        <ChildProfileContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
