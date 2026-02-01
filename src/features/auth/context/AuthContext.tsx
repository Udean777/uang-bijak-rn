import { auth } from "@/src/config/firebase";
import { AuthService } from "@/src/services/authService";
import { UserProfile } from "@/src/types/user";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, ReactNode, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

interface AuthContextType {
  user: any | null; // Keep as any to avoid type conflicts with firebase/auth User during refactor if needed
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean | null;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  hasSeenOnboarding: null,
  setHasSeenOnboarding: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    userProfile,
    isLoading,
    hasSeenOnboarding,
    setUser,
    setUserProfile,
    setIsLoading,
    setHasSeenOnboarding,
    initializeAuth,
    refreshProfile,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
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
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile, setIsLoading]);

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
