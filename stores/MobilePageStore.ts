import { create } from 'zustand';
import { createJSONStorage, persist } from "zustand/middleware";
import { EMobilePage } from '../types/mobile';

export type MobilePageStore = {
    selectedTab: EMobilePage | EMobilePage.HOME;
    setSelectedTab: (tab: EMobilePage) => void;
};

export const useMobilePageStore = create<MobilePageStore>()(
	persist(
		(set) => ({
			selectedTab: EMobilePage.HOME,
			setSelectedTab: (tab: EMobilePage) => set({ selectedTab: tab }),
		}),
		{
			name: "mobile-page-store",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
