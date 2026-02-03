import { RecurringService } from "@/src/services/recurringService";
import {
  CreateRecurringPayload,
  RecurringTransaction,
} from "@/src/types/recurring";
import { create } from "zustand";

interface RecurringState {
  recurring: RecurringTransaction[];
  isLoading: boolean;

  // Actions
  initializeRecurring: (userId: string) => () => void;
  setRecurring: (recurring: RecurringTransaction[]) => void;
  addRecurring: (userId: string, data: CreateRecurringPayload) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  updateRecurring: (
    id: string,
    data: Partial<CreateRecurringPayload>,
  ) => Promise<void>;
}

export const useRecurringStore = create<RecurringState>((set) => ({
  recurring: [],
  isLoading: false,

  initializeRecurring: (userId) => {
    set({ isLoading: true });
    const unsubscribe = RecurringService.subscribeRecurring(userId, (data) => {
      set({ recurring: data, isLoading: false });
    });
    return unsubscribe;
  },

  setRecurring: (recurring) => set({ recurring }),

  addRecurring: async (userId, data) => {
    set({ isLoading: true });
    try {
      await RecurringService.addRecurring(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRecurring: async (id) => {
    try {
      await RecurringService.deleteRecurring(id);
    } catch (error) {
      throw error;
    }
  },

  toggleActive: async (id, isActive) => {
    try {
      await RecurringService.toggleActive(id, isActive);
    } catch (error) {
      throw error;
    }
  },

  updateRecurring: async (id, data) => {
    set({ isLoading: true });
    try {
      await RecurringService.updateRecurring(id, data);
    } finally {
      set({ isLoading: false });
    }
  },
}));
