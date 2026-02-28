import BottomNavbar from "@/components/layouts/bottomNavbar";
import TopbarMobile from "@/components/layouts/topbarMobile";
import { Suspense } from "react";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <TopbarMobile />
      <main className="flex-1 w-full bg-white min-h-[calc(100vh-80px)] shadow-sm">
        {children}
      </main>
      <Suspense 
        fallback={
          <div className="fixed bottom-0 w-full h-[72px] bg-white border-t border-gray-100 z-50 animate-pulse" />
        }
      >
        <BottomNavbar />
      </Suspense>
    </div>
  );
}
