"use client";

import { useState, useEffect } from "react";
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

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = authClient.useSession();
  const userRole = (session as CustomSession)?.user?.role;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredNavItems = sidebarNavItems.filter((item) => {
    if (
      item.type === ESidebar.USER_REQUEST ||
      item.type === ESidebar.GROWTH_REFERENCE ||
      item.type === ESidebar.DEVELOPMENT
    ) {
      return userRole === Role.ADMIN;
    }
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="font-bold text-lg text-primary">Growth Check</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isMounted && filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
