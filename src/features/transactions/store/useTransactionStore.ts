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

export const useTransactionStore = create<TransactionState>((set, get) => ({
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
    const tempId = `temp-${Date.now()}`;
    const newTransaction: Transaction = {
      id: tempId,
      userId,
      ...data,
      date: data.date.getTime(),
      createdAt: Date.now(),
    };

    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));

    try {
      await TransactionService.addTransaction(userId, data);
    } catch (error: unknown) {
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== tempId),
      }));
      throw error;
    }
  },

  updateTransaction: async (id, oldData, newData) => {
    const previousTransactions = get().transactions;
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id
          ? {
              ...t,
              ...newData,
              date: newData.date.getTime(),
              updatedAt: Date.now(),
            }
          : t,
      ),
    }));
    try {
      await TransactionService.updateTransaction(id, oldData, newData);
    } catch (error: unknown) {
      set({ transactions: previousTransactions });
      throw error;
    }
  },

  deleteTransaction: async (id, oldData) => {
    const previousTransactions = get().transactions;
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    try {
      await TransactionService.deleteTransaction(id, oldData);
    } catch (error: unknown) {
      set({ transactions: previousTransactions });
      throw error;
    }
  },

  addCategory: async (userId, name, type) => {
    try {
      await CategoryService.addCategory(userId, name, type);
    } catch (error: unknown) {
      throw error;
    }
  },
}));
