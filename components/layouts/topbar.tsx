"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Search, Bell, Settings, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { ESidebar, ESidebarToThai } from "@/types";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

// Optional helper to get current page title from pathname
function getPageTitle(pathname: string) {
  if (pathname.startsWith("/desktop/profile")) return "โปรไฟล์";
  if (pathname.startsWith("/desktop/dashboard"))
    return ESidebarToThai[ESidebar.DASHBOARD];
  if (pathname.startsWith("/desktop/location"))
    return ESidebarToThai[ESidebar.LOCATION];
  if (pathname.startsWith("/desktop/staff")) return ESidebarToThai[ESidebar.STAFF];
  if (pathname.startsWith("/desktop/children")) return ESidebarToThai[ESidebar.CHILD];
  if (pathname.startsWith("/desktop/requests"))
    return ESidebarToThai[ESidebar.REQUEST];
  if (pathname.startsWith("/desktop/user-requests"))
    return ESidebarToThai[ESidebar.USER_REQUEST];
  return "ระบบจัดการส่วนกลาง";
}

export default function TopbarDesktop() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { data: session } = authClient.useSession();

  return (
    <header className="flex bh-20 shrink-0 items-center justify-between gap-6 bg-surface/85 shadow-lg shadow-primary/10 backdrop-blur-xl px-8 sticky top-0 z-10 w-full border-b-0">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-2 size-10 hover:bg-surface-container-low transition-colors rounded-xl" />
        <h1 className="text-headline-md text-on-surface font-bold tracking-tight hidden lg:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">

        <Link
          href="/desktop/profile"
          className="flex items-center gap-4 hover:bg-surface-container-low p-2 pr-4 rounded-2xl transition-all group"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-body-lg font-bold text-on-surface leading-none group-hover:text-primary transition-colors">
              {session?.user?.name || "ผู้ใช้งาน"}
            </span>
            <span className="text-label-md text-on-surface-variant font-medium mt-1 uppercase tracking-wider">
              {(session?.user as any)?.role || "เจ้าหน้าที่"}
            </span>
          </div>
          <div className="size-12 bg-primary-fixed rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden group-hover:scale-105 transition-transform">
             {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="size-full object-cover" />
             ) : (
                <UserCircle className="size-8 text-primary shadow-sm" />
             )}
          </div>
        </Link>
      </div>
    </header>
  );
}
