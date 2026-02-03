import { create } from "zustand";

export type InfoModalType = "safeToSpend" | "balance" | "status" | null;

interface CarouselState {
  activeIndex: number;
  infoModal: InfoModalType;

  // Actions
  setActiveIndex: (index: number) => void;
  goNext: (maxIndex: number) => void;
  goPrev: () => void;
  openInfoModal: (type: InfoModalType) => void;
  closeInfoModal: () => void;
  reset: () => void;
}

export const useSafeToSpendStore = create<CarouselState>((set, get) => ({
  activeIndex: 0,
  infoModal: null,

  setActiveIndex: (index) => set({ activeIndex: index }),

  goNext: (maxIndex) => {
    const { activeIndex } = get();
    if (activeIndex < maxIndex) {
      set({ activeIndex: activeIndex + 1 });
    }
  },

  goPrev: () => {
    const { activeIndex } = get();
    if (activeIndex > 0) {
      set({ activeIndex: activeIndex - 1 });
    }
  },

  openInfoModal: (type) => set({ infoModal: type }),
  closeInfoModal: () => set({ infoModal: null }),

  reset: () => set({ activeIndex: 0, infoModal: null }),
}));
