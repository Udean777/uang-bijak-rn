import { SubscriptionService } from "@/src/services/subscriptionService";
import {
  CreateSubscriptionPayload,
  Subscription,
} from "@/src/types/subscription";
import { create } from "zustand";

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;

  // Actions
  setSubscriptions: (subscriptions: Subscription[]) => void;
  initializeSubscriptions: (userId: string) => () => void;
  addSubscription: (
    userId: string,
    data: CreateSubscriptionPayload,
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  renewSubscription: (
    id: string,
    currentNextPayment: number,
    fixedDay: number,
  ) => Promise<void>;
  getPendingBillsTotal: () => number;
  updateSubscription: (
    id: string,
    data: Partial<CreateSubscriptionPayload>,
  ) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: true,

  setSubscriptions: (subscriptions) => set({ subscriptions }),

  initializeSubscriptions: (userId) => {
    set({ isLoading: true });
    const unsubscribe = SubscriptionService.subscribeSubscriptions(
      userId,
      (data) => {
        set({ subscriptions: data, isLoading: false });
      },
    );
    return unsubscribe;
  },

  addSubscription: async (userId, data) => {
    set({ isLoading: true });
    try {
      await SubscriptionService.addSubscription(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSubscription: async (id) => {
    set({ isLoading: true });
    try {
      await SubscriptionService.deleteSubscription(id);
    } finally {
      set({ isLoading: false });
    }
  },

  renewSubscription: async (id, currentNextPayment, fixedDay) => {
    set({ isLoading: true });
    try {
      await SubscriptionService.renewSubscription(
        id,
        currentNextPayment,
        fixedDay,
      );
    } finally {
      set({ isLoading: false });
    }
  },

  updateSubscription: async (id, data) => {
    set({ isLoading: true });
    try {
      await SubscriptionService.updateSubscription(id, data);
    } finally {
      set({ isLoading: false });
    }
  },

  getPendingBillsTotal: () => {
    const { subscriptions } = get();
    return SubscriptionService.getPendingBillsTotal(subscriptions);
  },
}));
