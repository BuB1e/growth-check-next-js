import { create } from 'zustand';
import { createJSONStorage, persist } from "zustand/middleware";
import { EBottomNavbar } from '../types/mobile';

export type BottomNavBarStore = {
    selectedTab: EBottomNavbar | EBottomNavbar.HOME;
    setSelectedTab: (tab: EBottomNavbar) => void;
};

export const useBottomNavBarStore = create<BottomNavBarStore>()(
	persist(
		(set) => ({
			selectedTab: EBottomNavbar.HOME,
			setSelectedTab: (tab: EBottomNavbar) => set({ selectedTab: tab }),
		}),
		{
			name: "bottom-nav-bar-store",
			storage: createJSONStorage(() => localStorage),
		}
	)
);