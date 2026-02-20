"use client";

import { useSession, signOut } from "@/lib/auth/auth-client";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

interface TopbarProps {
  title?: string;
  showMenuToggle?: boolean;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export default function Topbar({
  title = "GrowthCheck",
  showMenuToggle = false,
  onMenuToggle,
  isMenuOpen = false,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {showMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      {isMockMode ? <MockUserInfo /> : <RealUserInfo />}
    </header>
  );
}

function MockUserInfo() {
  const mockRole = process.env.NEXT_PUBLIC_DEV_MOCK_ROLE || "ADMIN";
  const mockNames: Record<string, string> = {
    ADMIN: "สมชาย จันทร์",
    HEAD: "สมหญิง ศรี",
    STAFF: "สมศักดิ์ ดี",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {mockNames[mockRole] || "Mock User"}
        </span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {mockRole}
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          DEV
        </span>
      </div>
    </div>
  );
}

function RealUserInfo() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-sm text-gray-600">{user.name}</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {(user as { role?: string }).role}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => signOut()}
        title="ออกจากระบบ"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
