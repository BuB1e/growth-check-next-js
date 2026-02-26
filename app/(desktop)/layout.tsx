import DesktopSidebar from "@/components/layouts/desktopSidebar";
import TopbarDesktop from "@/components/layouts/topbar";

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
	return <>
		<DesktopSidebar />
		<TopbarDesktop />
		{children}
	</>;
}
