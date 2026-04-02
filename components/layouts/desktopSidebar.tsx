"use client";

import { useSyncExternalStore } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ESidebar, ESidebarToThai, Role } from "@/types";
import { authClient } from "@/lib/auth/auth-client";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Baby,
  FileText,
  UserPlus,
  BarChart2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface CustomSession {
  user?: {
    role?: Role;
  };
}

const sidebarNavItems = [
  {
    title: ESidebarToThai[ESidebar.DASHBOARD],
    url: "/desktop/dashboard",
    icon: LayoutDashboard,
    type: ESidebar.DASHBOARD,
  },
  {
    title: ESidebarToThai[ESidebar.LOCATION],
    url: "/desktop/location",
    icon: MapPin,
    type: ESidebar.LOCATION,
  },
  {
    title: ESidebarToThai[ESidebar.STAFF],
    url: "/desktop/staff",
    icon: Users,
    type: ESidebar.STAFF,
  },
  {
    title: ESidebarToThai[ESidebar.CHILD],
    url: "/desktop/children",
    icon: Baby,
    type: ESidebar.CHILD,
  },
  {
    title: ESidebarToThai[ESidebar.REQUEST],
    url: "/desktop/requests",
    icon: FileText,
    type: ESidebar.REQUEST,
  },
  {
    title: ESidebarToThai[ESidebar.USER_REQUEST],
    url: "/desktop/user-requests",
    icon: UserPlus,
    type: ESidebar.USER_REQUEST,
  },
  {
    title: ESidebarToThai[ESidebar.GROWTH_REFERENCE],
    url: "/desktop/growth-references",
    icon: BarChart2,
    type: ESidebar.GROWTH_REFERENCE,
  },
  {
    title: ESidebarToThai[ESidebar.DEVELOPMENT],
    url: "/desktop/development",
    icon: Sparkles,
    type: ESidebar.DEVELOPMENT,
  },
];

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const userRole = (session as CustomSession)?.user?.role;
  const isHydrated = useIsHydrated();

  const filteredNavItems = sidebarNavItems.filter((item) => {
    if (
      item.type === ESidebar.USER_REQUEST ||
      item.type === ESidebar.GROWTH_REFERENCE ||
      item.type === ESidebar.DEVELOPMENT
    ) {
      if (!isHydrated) return false;
      return userRole === Role.ADMIN;
    }
    return true;
  });

  return (
    <Sidebar className="border-r-0 bg-surface/85 backdrop-blur-xl">
      <SidebarHeader className="p-8 pb-4 border-0">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-headline-md leading-tight text-primary font-bold text-center">
            Growth Check
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-6 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {filteredNavItems.map((item) => {
                const isActive = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-14 px-4 rounded-xl transition-all duration-300",
                        isActive
                          ? "data-active:bg-primary! data-active:text-white! shadow-lg shadow-primary/20"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-4">
                        <item.icon className={cn("size-6", isActive ? "text-white!" : "text-primary")} />
                        <span className={cn("text-2xl font-bold", isActive ? "text-white!" : "text-on-surface-variant")}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
