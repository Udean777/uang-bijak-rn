import { auth } from "@/src/config/firebase";
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
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  hasSeenOnboarding: null,
  setHasSeenOnboarding: () => {},
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const fetchProfile = async (retry = 0) => {
          try {
            const profile = await AuthService.getUserProfile(currentUser.uid);
            setUserProfile(profile);
          } catch (error: any) {
            // Jika profil belum ada (race condition saat register), coba lagi
            if (error.message.includes("tidak ditemukan") && retry < 3) {
              setTimeout(() => fetchProfile(retry + 1), 1000);
            } else {
              console.error("Gagal ambil profil", error);
            }
          }
        };
        fetchProfile();
      } else {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
