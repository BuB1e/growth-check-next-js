import { Suspense } from "react";
import { MobileChildList } from "@/components/features/mobile/childList";
import { ChildListFilters } from "@/components/features/mobile/ChildListFilters";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { EnvConfig } from "@/configs/BackendConfig";

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
  const heightDev =
    typeof searchParams?.heightDev === "string" ? searchParams.heightDev : "";
  const weightDev =
    typeof searchParams?.weightDev === "string" ? searchParams.weightDev : "";
  const locationId =
    typeof searchParams?.locationId === "string" ? searchParams.locationId : "";
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
      : EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_MOBILE_SIZE;

  return (
    <MobileChildList
      page={page}
      search={q}
      status={status}
      minAgeYears={minAgeYears}
      maxAgeYears={maxAgeYears}
      minAge={minAge}
      maxAge={maxAge}
      heightDev={heightDev}
      weightDev={weightDev}
      locationId={locationId}
      limit={limit}
    />
  );
}

export default function StaffHomePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="space-y-4 px-4 pt-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          รายชื่อเด็ก
        </h2>
        <p className="mt-1 text-[15px] text-gray-500">
          ค้นหาและเพิ่มข้อมูลการเจริญเติบโต
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-20 animate-pulse bg-gray-100 rounded-2xl mb-4" />
        }
      >
        <ChildListFilters />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <ChildListWrapper searchParamsPromise={props.searchParams} />
      </Suspense>

      {/* Floating Action Button */}
      <Link
        href="/mobile/staff/create_child"
        className="fixed right-5 bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform active:scale-95 hover:bg-blue-700"
        aria-label="เพิ่มเด็กใหม่"
      >
        <UserPlus className="h-6 w-6" />
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
