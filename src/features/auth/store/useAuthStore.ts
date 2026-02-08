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
  isInitialized: boolean;
  hasSeenOnboarding: boolean | null;

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => Promise<void>;
  initializeAuth: () => () => void;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  isInitialized: false,
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

  initializeAuth: () => {
    const { setUser, setUserProfile, setIsLoading } = get();

    AsyncStorage.getItem("hasSeenOnboarding").then((value) => {
      set({ hasSeenOnboarding: value === "true" });
    });

    const { auth } = require("@/src/config/firebase");
    const { onAuthStateChanged } = require("firebase/auth");

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser: User | null) => {
        setIsLoading(true);
        setUser(currentUser);

        if (currentUser) {
          try {
            const profile = await AuthService.getUserProfile(currentUser.uid);

            if (profile && profile.emailVerified === false) {
              await AuthService.ensureEmailVerified(currentUser.uid);
              profile.emailVerified = true;
            }

            setUserProfile(profile);
          } catch (error: any) {
            console.error("[useAuthStore] Failed to fetch profile", error);
          }
        } else {
          setUserProfile(null);
        }

        set({ isLoading: false, isInitialized: true });
      },
    );

    return unsubscribe;
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
  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const user = await AuthService.login(email, password);

      return user;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true });

    try {
      const user = await AuthService.loginWithGoogle(idToken);

      return user;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (payload) => {
    set({ isLoading: true });

    try {
      await AuthService.register(payload);
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => {
    clearSentryUser();
    set({ user: null, userProfile: null });
  },
}));
