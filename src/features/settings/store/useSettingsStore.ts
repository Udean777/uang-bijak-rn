import { SecurityService } from "@/src/services/SecurityService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  setPin: (pin: string) => Promise<void>;
  checkBiometricHardware: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  unlock: () => void;
  lock: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "system",
      isLocked: false,
      isBiometricEnabled: false,
      hasPin: false,
      isLoading: true,

      setTheme: (theme) => {
        set({ theme });
      },

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

          if (hasPin) {
            set({ isLocked: true });
          }
        } catch (error: unknown) {
          console.error("Failed to initialize settings", error);
          set({ isLoading: false });
        }
      },

      checkSecurityStatus: async () => {
        const isBiometricEnabled = await SecurityService.isBiometricEnabled();
        const hasPin = await SecurityService.hasPin();
        set({ isBiometricEnabled, hasPin });
      },

      setPin: async (pin) => {
        set({ isLoading: true });
        try {
          await SecurityService.setPin(pin);
          set({ hasPin: true });
        } finally {
          set({ isLoading: false });
        }
      },

      checkBiometricHardware: async () => {
        return await SecurityService.checkHardware();
      },

      enableBiometric: async () => {
        const success = await SecurityService.authenticateBiometric();
        if (success) {
          await SecurityService.setBiometricEnabled(true);
          set({ isBiometricEnabled: true });
        }
        return success;
      },

      unlock: () => set({ isLocked: false }),

      lock: async () => {
        const hasPin = await SecurityService.hasPin();
        if (hasPin) {
          set({ isLocked: true });
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
