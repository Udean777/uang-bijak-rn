import { DebtService } from "@/src/services/debtService";
import { Debt, DebtStatus } from "@/src/types/debt";
import { create } from "zustand";

interface DebtState {
  debts: Debt[];
  isLoading: boolean;

  // Actions
  setDebts: (debts: Debt[]) => void;
  initializeDebts: (userId: string) => () => void;
  addDebt: (
    userId: string,
    data: Omit<Debt, "id" | "createdAt" | "status" | "userId">,
  ) => Promise<void>;
  updateStatus: (id: string, status: DebtStatus) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

export const useDebtStore = create<DebtState>((set) => ({
  debts: [],
  isLoading: true,

  setDebts: (debts) => set({ debts }),

  initializeDebts: (userId) => {
    set({ isLoading: true });
    const unsubscribe = DebtService.subscribeDebts(userId, (data) => {
      set({ debts: data, isLoading: false });
    });
    return unsubscribe;
  },

  addDebt: async (userId, data) => {
    set({ isLoading: true });
    try {
      await DebtService.addDebt(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    try {
      await DebtService.updateStatus(id, status);
    } catch (error: unknown) {
      throw error;
    }
  },

  deleteDebt: async (id) => {
    try {
      await DebtService.deleteDebt(id);
    } catch (error: unknown) {
      throw error;
    }
  },
}));
