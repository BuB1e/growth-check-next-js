"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { ESidebar, ESidebarToThai } from "@/types";
import { SignOutButton } from "@/components/features/shared/SignOutButton";

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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-6 shadow-sm sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-2" />
        <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        <SignOutButton
          variant="outline"
          className="flex items-center gap-2 hover:bg-red-50 p-2 rounded-xl transition-all text-red-600 border border-red-100 active:scale-95 group"
        >
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
            <LogOut className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-sm font-bold hidden md:block">ออกจากระบบ</span>
        </SignOutButton>

        <Link
          href="/desktop/profile"
          className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl transition-colors ring-1 ring-slate-100"
        >
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-sm font-bold hidden md:block">โปรไฟล์</span>
        </Link>

      </div>
    </header>
  );
}
