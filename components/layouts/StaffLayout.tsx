"use client";

import Topbar from "@/components/layouts/topbar";
import BottomNavbar from "@/components/layouts/bottomNavbar";
import { type ReactNode } from "react";

interface StaffLayoutProps {
  children: ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Topbar title="GrowthCheck" />
      <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4">{children}</main>
      <BottomNavbar />
    </div>
  );
}
