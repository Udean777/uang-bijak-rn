import { BudgetService } from "@/src/services/budgetService";
import { CategoryBudget, CreateBudgetPayload } from "@/src/types/budget";
import { create } from "zustand";

interface BudgetState {
  budgets: CategoryBudget[];
  isLoading: boolean;

  // Actions
  initializeBudgets: (
    userId: string,
    month: number,
    year: number,
  ) => () => void;
  setBudgets: (budgets: CategoryBudget[]) => void;
  setBudget: (userId: string, data: CreateBudgetPayload) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  isLoading: false,

  initializeBudgets: (userId, month, year) => {
    set({ isLoading: true });
    const unsubscribe = BudgetService.subscribeBudgets(
      userId,
      month,
      year,
      (data) => {
        set({ budgets: data, isLoading: false });
      },
    );
    return unsubscribe;
  },

  setBudgets: (budgets) => set({ budgets }),

  setBudget: async (userId, data) => {
    set({ isLoading: true });
    try {
      await BudgetService.setBudget(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBudget: async (id) => {
    try {
      await BudgetService.deleteBudget(id);
    } catch (error: unknown) {
      throw error;
    }
  },
}));
