"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "หน้าหลัก", icon: Home, href: "/staff" },
  { label: "เขต", icon: MapPin, href: "/staff/location" },
  { label: "โปรไฟล์", icon: User, href: "/staff/profile" },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white safe-area-pb">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/staff" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
