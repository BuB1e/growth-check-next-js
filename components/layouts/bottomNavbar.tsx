"use client";

import { useMobilePageStore } from "@/stores/MobilePageStore";
import { EMobilePage, EMobilePageToThai } from "@/types";
import { Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function BottomNavbar() {
  const { selectedTab, setSelectedTab } = useMobilePageStore();
  const pathname = usePathname();

  const tabs = [
    {
      id: EMobilePage.HOME,
      label: EMobilePageToThai[EMobilePage.HOME],
      icon: Home,
      href: "/mobile/staff/home",
    },
    {
      id: EMobilePage.PROFILE,
      label: EMobilePageToThai[EMobilePage.PROFILE],
      icon: User,
      href: "/mobile/staff/profile",
    },
  ];

  useEffect(() => {
    if (pathname.includes("/home")) setSelectedTab(EMobilePage.HOME);
    if (pathname.includes("/profile")) setSelectedTab(EMobilePage.PROFILE);
  }, [pathname, setSelectedTab]);

  return (
    <nav className="fixed bottom-0 w-full bg-surface/85 backdrop-blur-xl border-t-0 flex justify-around items-center pb-safe pt-3 px-6 z-50 shadow-[0_-4px_32px_rgba(25,28,30,0.06)] h-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = selectedTab === tab.id;

        return (
          <Link
            href={tab.href}
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-2xl transition-all flex-1 gap-1 relative overflow-hidden",
              isActive ? "text-primary bg-primary-fixed/30" : "text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            {isActive && (
              <span className="absolute top-0 w-12 h-1 bg-primary rounded-full transition-all" />
            )}
            <Icon
              className={cn(
                "size-6 transition-all duration-300",
                isActive ? "scale-110" : "opacity-70"
              )}
            />
            <span className={cn(
              "text-label-md font-bold transition-all",
              isActive ? "text-primary" : "text-on-surface-variant font-medium"
            )}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
