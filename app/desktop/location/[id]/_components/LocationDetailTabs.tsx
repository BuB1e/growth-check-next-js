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
      <TabsList className="grid w-full grid-cols-3 h-14 p-1 rounded-xl bg-muted/50">
        <TabsTrigger value="info" className="rounded-lg gap-2 text-base font-semibold">
          <MapPin className="h-4 w-4" />
          ข้อมูลชุมชน
        </TabsTrigger>
        <TabsTrigger value="staff" className="rounded-lg gap-2 text-base font-semibold">
          <Users className="h-4 w-4" />
          เจ้าหน้าที่
        </TabsTrigger>
        <TabsTrigger value="children" className="rounded-lg gap-2 text-base font-semibold">
          <Baby className="h-4 w-4" />
          เด็กในความดูแล
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
