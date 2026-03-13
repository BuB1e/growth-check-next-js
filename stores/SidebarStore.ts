import { create } from 'zustand';
import { createJSONStorage, persist } from "zustand/middleware";
import { ESidebar } from '../types';

export type SidebarStore = {
    selectedTab: ESidebar | ESidebar.DASHBOARD;
    setSelectedTab: (tab: ESidebar) => void;
};

export const useSidebarStore = create<SidebarStore>()(
	persist(
		(set) => ({
			selectedTab: ESidebar.DASHBOARD,
			setSelectedTab: (tab: ESidebar) => set({ selectedTab: tab }),
		}),
		{
			name: "sidebar-store",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
