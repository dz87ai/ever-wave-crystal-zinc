import { create } from "zustand";

export type OpenTab = {
  id: number;
  rocNumber: string;
  title: string;
};

type TabsState = {
  tabs: OpenTab[];
  actionsOpen: boolean;
  activityOpen: boolean;
  add: (tab: OpenTab) => void;
  remove: (id: number) => void;
  openActions: () => void;
  closeActions: () => void;
  openActivity: () => void;
  closeActivity: () => void;
};

export const useOpenTabs = create<TabsState>((set, get) => ({
  tabs: [],
  actionsOpen: false,
  activityOpen: false,
  add: (tab) => {
    if (get().tabs.some((t) => t.id === tab.id)) {
      set({
        tabs: get().tabs.map((t) => (t.id === tab.id ? tab : t)),
      });
      return;
    }
    set({ tabs: [...get().tabs, tab] });
  },
  remove: (id) => set({ tabs: get().tabs.filter((t) => t.id !== id) }),
  openActions: () => set({ actionsOpen: true }),
  closeActions: () => set({ actionsOpen: false }),
  openActivity: () => set({ activityOpen: true }),
  closeActivity: () => set({ activityOpen: false }),
}));
