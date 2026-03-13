"use client";

import { useMobilePageStore } from "@/stores/MobilePageStore";
import { EMobilePage, EMobilePageToThai } from "@/types";
import { Home, MapPin, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
      id: EMobilePage.LOCATION,
      label: EMobilePageToThai[EMobilePage.LOCATION],
      icon: MapPin,
      href: "/mobile/staff/location", // Example future route
    },
    {
      id: EMobilePage.PROFILE,
      label: EMobilePageToThai[EMobilePage.PROFILE],
      icon: User,
      href: "/mobile/staff/profile", // Example future route
    },
  ];

  // Optional: Auto-sync tab state based on URL if user reloads directly
  useEffect(() => {
    if (pathname === "/staff/home") setSelectedTab(EMobilePage.HOME);
    // Add others if needed later
  }, [pathname, setSelectedTab]);

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center pb-safe pt-2 px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = selectedTab === tab.id;

        return (
          <Link
            href={tab.href}
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all flex-1 space-y-1 ${
              isActive
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon
              className={`w-6 h-6 transition-all ${isActive ? "scale-110 stroke-[2.5px]" : "stroke-2"}`}
            />
            <span
              className={`text-[16px] font-medium transition-colors ${
                isActive ? "text-blue-600 font-semibold" : "text-gray-500"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
