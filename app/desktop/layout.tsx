import { Suspense } from "react";
import DesktopSidebar from "@/components/layouts/desktopSidebar";
import TopbarDesktop from "@/components/layouts/topbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<DesktopSidebarFallback />}>
        <DesktopSidebar />
      </Suspense>
      <div className="flex flex-col w-full h-screen overflow-y-auto">
        <Suspense fallback={<TopbarFallback />}>
          <TopbarDesktop />
        </Suspense>
        <main
          className="flex-1 w-full bg-slate-50"
          style={{ fontSize: "18px" }}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

function DesktopSidebarFallback() {
  return <aside className="w-64 border-r bg-white" aria-hidden="true" />;
}

function TopbarFallback() {
  return <div className="h-16 border-b bg-white" aria-hidden="true" />;
}
