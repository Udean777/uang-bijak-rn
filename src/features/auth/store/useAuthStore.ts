import {
  clearUser as clearSentryUser,
  setUser as setSentryUser,
} from "@/src/config/sentry";
import { AuthService } from "@/src/services/authService";
import { UserProfile } from "@/src/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean | null;

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  hasSeenOnboarding: null,

  setUser: (user) => {
    if (user) {
      setSentryUser(user.uid, user.email || undefined);
    } else {
      clearSentryUser();
    }
    set({ user });
  },

  setUserProfile: (userProfile) => set({ userProfile }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setHasSeenOnboarding: async (seen: boolean) => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", seen.toString());
      set({ hasSeenOnboarding: seen });
    } catch (e) {
      console.error("Gagal simpan onboarding status", e);
    }
  },

  initializeAuth: async () => {
    try {
      const value = await AsyncStorage.getItem("hasSeenOnboarding");
      set({ hasSeenOnboarding: value === "true" });
    } catch (e) {
      set({ hasSeenOnboarding: false });
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (user) {
      try {
        const profile = await AuthService.getUserProfile(user.uid);
        set({ userProfile: profile });
      } catch (error) {
        console.error("Failed to refresh profile", error);
      }
    }
  },

  logout: () => {
    clearSentryUser();
    set({ user: null, userProfile: null });
  },
}));
