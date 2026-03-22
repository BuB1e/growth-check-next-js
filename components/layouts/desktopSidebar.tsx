"use client";

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
import { ESidebar, ESidebarToThai } from "@/types";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Baby,
  FileText,
  History,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    title: ESidebarToThai[ESidebar.HISTORY],
    url: "/desktop/history",
    icon: History,
    type: ESidebar.HISTORY,
  },
];

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="font-bold text-lg text-primary">Growth Check</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarNavItems.map((item) => (
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
