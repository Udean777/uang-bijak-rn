import { WishlistService } from "@/src/services/wishlistService";
import { Wishlist, WishlistStatus } from "@/src/types/wishlist";
import { create } from "zustand";

interface WishlistState {
  wishlists: Wishlist[];
  isLoading: boolean;

  // Actions
  setWishlists: (wishlists: Wishlist[]) => void;
  initializeWishlists: (userId: string) => () => void;
  addWishlist: (
    userId: string,
    data: { name: string; price: number; durationDays: number; note?: string },
  ) => Promise<void>;
  updateStatus: (id: string, status: WishlistStatus) => Promise<void>;
  deleteWishlist: (id: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlists: [],
  isLoading: true,

  setWishlists: (wishlists) => set({ wishlists }),

  initializeWishlists: (userId) => {
    set({ isLoading: true });
    const unsubscribe = WishlistService.subscribeWishlists(userId, (data) => {
      set({ wishlists: data, isLoading: false });
    });
    return unsubscribe;
  },

  addWishlist: async (userId, data) => {
    set({ isLoading: true });
    try {
      await WishlistService.addWishlist(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    try {
      await WishlistService.updateStatus(id, status);
    } catch (error) {
      throw error;
    }
  },

  deleteWishlist: async (id) => {
    try {
      await WishlistService.deleteWishlist(id);
    } catch (error) {
      throw error;
    }
  },
}));
