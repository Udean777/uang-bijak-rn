import { WalletService } from "@/src/services/walletService";
import { CreateWalletPayload, Wallet } from "@/src/types/wallet";
import { create } from "zustand";

interface WalletState {
  wallets: Wallet[];
  totalBalance: number;
  totalDebt: number;
  netWorth: number;
  isLoading: boolean;

  // Actions
  setWallets: (wallets: Wallet[]) => void;
  calculateTotals: (data: Wallet[]) => void;
  initializeWallets: (userId: string) => () => void;
  createWallet: (userId: string, data: CreateWalletPayload) => Promise<void>;
  updateWallet: (
    walletId: string,
    data: Partial<CreateWalletPayload>,
  ) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  totalBalance: 0,
  totalDebt: 0,
  netWorth: 0,
  isLoading: true,

  setWallets: (wallets) => {
    set({ wallets });
    get().calculateTotals(wallets);
  },

  calculateTotals: (data) => {
    const availableFunds = data
      .filter((w) => w.type !== "credit-card")
      .reduce((acc, curr) => acc + curr.balance, 0);

    const creditCardDebt = data
      .filter((w) => w.type === "credit-card")
      .reduce((acc, curr) => acc + curr.balance, 0);

    set({
      totalBalance: availableFunds,
      totalDebt: creditCardDebt,
      netWorth: availableFunds - creditCardDebt,
    });
  },

  initializeWallets: (userId) => {
    set({ isLoading: true });
    const unsubscribe = WalletService.subscribeWallets(userId, (data) => {
      set({ wallets: data, isLoading: false });
      get().calculateTotals(data);
    });
    return unsubscribe;
  },

  createWallet: async (userId, data) => {
    set({ isLoading: true });
    try {
      await WalletService.createWallet(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  updateWallet: async (walletId, data) => {
    set({ isLoading: true });
    try {
      await WalletService.updateWallet(walletId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWallet: async (walletId) => {
    set({ isLoading: true });
    try {
      await WalletService.deleteWallet(walletId);
    } finally {
      set({ isLoading: false });
    }
  },
}));
