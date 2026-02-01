import { SecurityService } from "@/src/services/SecurityService";
import { create } from "zustand";

interface SettingsState {
  theme: "light" | "dark" | "system";
  isLocked: boolean;
  isBiometricEnabled: boolean;
  hasPin: boolean;
  isLoading: boolean;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setIsLocked: (isLocked: boolean) => void;
  initializeSettings: () => Promise<void>;
  checkSecurityStatus: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: "system",
  isLocked: false,
  isBiometricEnabled: false,
  hasPin: false,
  isLoading: true,

  setTheme: (theme) => set({ theme }),

  setIsLocked: (isLocked) => set({ isLocked }),

  initializeSettings: async () => {
    set({ isLoading: true });
    try {
      const isBiometricEnabled = await SecurityService.isBiometricEnabled();
      const hasPin = await SecurityService.hasPin();

      set({
        isBiometricEnabled,
        hasPin,
        isLoading: false,
      });

      // Initial lock check
      if (hasPin) {
        set({ isLocked: true });
      }
    } catch (error) {
      console.error("Failed to initialize settings", error);
      set({ isLoading: false });
    }
  },

  checkSecurityStatus: async () => {
    const isBiometricEnabled = await SecurityService.isBiometricEnabled();
    const hasPin = await SecurityService.hasPin();
    set({ isBiometricEnabled, hasPin });
  },

  unlock: () => set({ isLocked: false }),

  lock: async () => {
    const hasPin = await SecurityService.hasPin();
    if (hasPin) {
      set({ isLocked: true });
    }
  },
}));
