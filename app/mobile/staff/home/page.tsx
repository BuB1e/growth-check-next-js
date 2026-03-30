import { Suspense } from "react";
import { MobileChildList } from "@/components/features/mobile/childList";
import { ChildListFilters } from "@/components/features/mobile/ChildListFilters";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { EnvConfig } from "@/configs/BackendConfig";
import { getCurrentSession } from "@/lib/auth/session.server";

// A wrapper component that handles the asynchronous searchParams
async function ChildListWrapper({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const searchParams = await searchParamsPromise;
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  const status =
    typeof searchParams?.status === "string" ? searchParams.status : "";
  const minAgeYears =
    typeof searchParams?.minAgeYears === "string"
      ? searchParams.minAgeYears
      : "";
  const maxAgeYears =
    typeof searchParams?.maxAgeYears === "string"
      ? searchParams.maxAgeYears
      : "";
  const minAge =
    typeof searchParams?.minAge === "string" ? searchParams.minAge : "";
  const maxAge =
    typeof searchParams?.maxAge === "string" ? searchParams.maxAge : "";
  const haStatus =
    typeof searchParams?.haStatus === "string" ? searchParams.haStatus : "";
  const waStatus =
    typeof searchParams?.waStatus === "string" ? searchParams.waStatus : "";
  const locationId =
    typeof searchParams?.locationId === "string" ? searchParams.locationId : "";
  const sex =
    typeof searchParams?.sex === "string" ? searchParams.sex : "";
  const page =
    typeof searchParams?.page === "string"
      ? parseInt(searchParams.page, 10)
      : 1;
  const parsedLimit =
    typeof searchParams?.limit === "string"
      ? parseInt(searchParams.limit, 10)
      : NaN;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : EnvConfig.PAGINATION_LIMIT_MOBILE_SIZE;

  const session = await getCurrentSession();
  const userId = session?.user.id;

  return (
    <MobileChildList
      page={page}
      search={q}
      status={status}
      minAgeYears={minAgeYears}
      maxAgeYears={maxAgeYears}
      minAge={minAge}
      maxAge={maxAge}
      haStatus={haStatus}
      waStatus={waStatus}
      locationId={locationId}
      sex={sex}
      limit={limit}
      userId={userId!}
    />
  );
}

async function GlobalGreeting() {
  const session = await getCurrentSession();
  const name = session?.user?.name || "เจ้าหน้าที่";
  const hour = new Date().getHours();

  let greeting = "สวัสดี";
  if (hour >= 5 && hour < 12) greeting = "สวัสดีตอนเช้า";
  else if (hour >= 12 && hour < 17) greeting = "สวัสดีตอนบ่าย";
  else if (hour >= 17 && hour < 22) greeting = "สวัสดีตอนเย็น";
  else greeting = "สวัสดียามค่ำคืน";

  return (
    <div className="mb-6 space-y-1">
      <h2 className="text-display-lg font-bold text-on-surface tracking-tight">
        {greeting},
      </h2>
      <p className="text-headline-md font-medium text-primary leading-none">
        {name}
      </p>
    </div>
  );
}

export default function StaffHomePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-32">
      <Suspense fallback={<div className="h-20 animate-pulse bg-surface-container-low rounded-2xl" />}>
        <GlobalGreeting />
      </Suspense>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-md font-bold text-on-surface">รายชื่อเด็ก</h3>
          <span className="text-body-lg text-on-surface-variant font-medium">ดูทั้งหมด</span>
        </div>

        <Suspense
          fallback={
            <div className="h-14 animate-pulse bg-surface-container-low rounded-xl" />
          }
        >
          <ChildListFilters />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <ChildListWrapper searchParamsPromise={props.searchParams} />
        </Suspense>
      </div>

      {/* Floating Action Button - Enhanced */}
      <Link
        href="/mobile/staff/create_child"
        className="fixed right-6 bottom-28 z-50 flex size-16 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40 transition-transform active:scale-90 hover:scale-105"
        aria-label="เพิ่มเด็กใหม่"
      >
        <UserPlus className="size-8" />
      </Link>
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-3 animate-pulse pb-24">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-[88px] bg-gray-100/80 rounded-2xl border border-gray-100"
        ></div>
      ))}
    </div>
  );
}
