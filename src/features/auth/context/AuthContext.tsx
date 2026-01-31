import { auth } from "@/src/config/firebase";
import {
  clearUser as clearSentryUser,
  setUser as setSentryUser,
} from "@/src/config/sentry";
import { AuthService } from "@/src/services/authService";
import { UserProfile } from "@/src/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean | null;
  setHasSeenOnboarding: (value: boolean) => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  hasSeenOnboarding: null,
  setHasSeenOnboarding: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem("hasSeenOnboarding");
        setHasSeenOnboardingState(value === "true");
      } catch (e) {
        setHasSeenOnboardingState(false);
      }
    };
    checkOnboarding();
  }, []);

  const setHasSeenOnboarding = async (value: boolean) => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", value.toString());
      setHasSeenOnboardingState(value);
    } catch (e) {
      console.error("Gagal simpan onboarding status", e);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await AuthService.getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to refresh profile", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Set Sentry user for crash tracking
        setSentryUser(currentUser.uid, currentUser.email || undefined);

        const fetchProfile = async (retry = 0) => {
          try {
            const profile = await AuthService.getUserProfile(currentUser.uid);

            // Auto-verify existing users if they were registered before OTP removal
            if (profile && profile.emailVerified === false) {
              await AuthService.ensureEmailVerified(currentUser.uid);
              profile.emailVerified = true;
            }

            setUserProfile(profile);
          } catch (error: any) {
            // Jika profil belum ada (race condition saat register), coba lagi
            if (error.message.includes("tidak ditemukan") && retry < 3) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              await fetchProfile(retry + 1);
            } else {
              console.error("Gagal ambil profil", error);
            }
          }
        };
        await fetchProfile();
      } else {
        // Clear Sentry user on logout
        clearSentryUser();
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthenticated: !!user,
        hasSeenOnboarding,
        setHasSeenOnboarding,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
