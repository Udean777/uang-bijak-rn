import { auth } from "@/src/config/firebase";
import { AuthService } from "@/src/services/authService";
import { UserProfile } from "@/src/types/user";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const profile = await AuthService.getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Gagal ambil profil", error);
        }
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userProfile, isLoading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
