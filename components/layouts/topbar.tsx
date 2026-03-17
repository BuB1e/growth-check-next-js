"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { ESidebar, ESidebarToThai } from "@/types";

// Optional helper to get current page title from pathname
function getPageTitle(pathname: string) {
  if (pathname.startsWith("/dashboard"))
    return ESidebarToThai[ESidebar.DASHBOARD];
  if (pathname.startsWith("/location"))
    return ESidebarToThai[ESidebar.LOCATION];
  if (pathname.startsWith("/staff")) return ESidebarToThai[ESidebar.STAFF];
  if (pathname.startsWith("/children")) return ESidebarToThai[ESidebar.CHILD];
  if (pathname.startsWith("/requests"))
    return ESidebarToThai[ESidebar.REQUEST];
  if (pathname.startsWith("/history"))
    return ESidebarToThai[ESidebar.HISTORY];
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
        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-sm font-medium hidden md:block">โปรไฟล์</div>
        </div>
      </div>
    </header>
  );
}
