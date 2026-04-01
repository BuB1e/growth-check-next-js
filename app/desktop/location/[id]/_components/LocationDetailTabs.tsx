"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { Users, Baby, MapPin } from "lucide-react";

interface LocationDetailTabsProps {
  activeTab: string;
  infoContent: ReactNode;
  staffContent: ReactNode;
  childrenContent: ReactNode;
}

export function LocationDetailTabs({
  activeTab,
  infoContent,
  staffContent,
  childrenContent,
}: LocationDetailTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 group-data-[orientation=horizontal]/tabs:h-20 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 shadow-sm gap-2">
        <TabsTrigger 
          value="info" 
          className="h-full rounded-lg gap-2.5 text-sm lg:text-base font-semibold transition-all duration-200 text-slate-600 dark:text-slate-300 data-[state=active]:bg-primary-container data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800/60 px-4 py-2 min-w-0"
        >
          <MapPin className="h-5 w-5 lg:h-5 lg:w-5 shrink-0" />
          <span className="truncate">ข้อมูลชุมชน</span>
        </TabsTrigger>
        <TabsTrigger 
          value="staff" 
          className="h-full rounded-lg gap-2.5 text-sm lg:text-base font-semibold transition-all duration-200 text-slate-600 dark:text-slate-300 data-[state=active]:bg-primary-container data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800/60 px-4 py-2 min-w-0"
        >
          <Users className="h-5 w-5 lg:h-5 lg:w-5 shrink-0" />
          <span className="truncate">เจ้าหน้าที่</span>
        </TabsTrigger>
        <TabsTrigger 
          value="children" 
          className="h-full rounded-lg gap-2.5 text-sm lg:text-base font-semibold transition-all duration-200 text-slate-600 dark:text-slate-300 data-[state=active]:bg-primary-container data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800/60 px-4 py-2 min-w-0"
        >
          <Baby className="h-5 w-5 lg:h-5 lg:w-5 shrink-0" />
          <span className="truncate">เด็กในความดูแล</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="mt-6 animate-in fade-in-50 duration-300">
        {infoContent}
      </TabsContent>
      <TabsContent value="staff" className="mt-6 animate-in fade-in-50 duration-300">
        {staffContent}
      </TabsContent>
      <TabsContent value="children" className="mt-6 animate-in fade-in-50 duration-300">
        {childrenContent}
      </TabsContent>
    </Tabs>
  );
}
