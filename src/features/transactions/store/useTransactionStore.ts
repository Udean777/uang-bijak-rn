import { Category, CategoryService } from "@/src/services/categoryService";
import { TransactionService } from "@/src/services/transactionService";
import { CreateTransactionPayload, Transaction } from "@/src/types/transaction";
import { create } from "zustand";

interface TransactionState {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;

  // Actions
  initializeTransactions: (userId: string) => () => void;
  initializeCategories: (userId: string) => () => void;
  setTransactions: (transactions: Transaction[]) => void;
  setCategories: (categories: Category[]) => void;

  addTransaction: (
    userId: string,
    data: CreateTransactionPayload,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    oldData: Transaction,
    newData: CreateTransactionPayload,
  ) => Promise<void>;
  deleteTransaction: (id: string, oldData: Transaction) => Promise<void>;
  addCategory: (
    userId: string,
    name: string,
    type: "income" | "expense",
  ) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  categories: [],
  isLoading: false,

  initializeTransactions: (userId) => {
    set({ isLoading: true });
    const unsubscribe = TransactionService.subscribeTransactions(
      userId,
      (data) => {
        set({ transactions: data, isLoading: false });
      },
    );
    return unsubscribe;
  },

  initializeCategories: (userId) => {
    const unsubscribe = CategoryService.subscribeCategories(userId, (data) => {
      set({ categories: data });
    });
    return unsubscribe;
  },

  setTransactions: (transactions) => set({ transactions }),
  setCategories: (categories) => set({ categories }),

  addTransaction: async (userId, data) => {
    set({ isLoading: true });
    try {
      await TransactionService.addTransaction(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id, oldData, newData) => {
    set({ isLoading: true });
    try {
      await TransactionService.updateTransaction(id, oldData, newData);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id, oldData) => {
    set({ isLoading: true });
    try {
      await TransactionService.deleteTransaction(id, oldData);
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (userId, name, type) => {
    try {
      await CategoryService.addCategory(userId, name, type);
    } catch (error) {
      throw error;
    }
  },
}));
