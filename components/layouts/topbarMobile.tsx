"use client";

import { useSyncExternalStore } from "react";
import { useMobilePageStore } from "@/stores/MobilePageStore";
import { EMobilePageToThai } from "@/types";
import { ChevronLeft, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function TopbarMobile() {
  const router = useRouter();
  const selectedTab = useMobilePageStore((state) => state.selectedTab);
  const { data: session } = authClient.useSession();
  const isHydrated = useIsHydrated();
  const avatarImage = isHydrated ? session?.user?.image : null;

  return (
    <header className="flex h-20 shrink-0 items-center justify-between px-6 bg-surface/85 backdrop-blur-xl sticky top-0 z-50 w-full border-b-0 shadow-sm">
      <button
        onClick={() => router.back()}
        className="size-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant active:scale-90 transition-all"
        aria-label="กลับไปหน้าก่อนหน้า"
      >
        <ChevronLeft className="size-6" />
      </button>

      <h1 className="text-3xl font-bold text-on-surface absolute left-1/2 -translate-x-1/2">
        {EMobilePageToThai[selectedTab] || selectedTab}
      </h1>

      <Link
        href="/mobile/staff/profile"
        className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center overflow-hidden active:scale-90 transition-all shadow-lg shadow-primary/10"
      >
        {avatarImage ? (
          <img src={avatarImage} alt="Avatar" className="size-full object-cover" />
         ) : (
            <UserCircle className="size-6 text-primary" />
         )}
      </Link>
    </header>
  );
}
