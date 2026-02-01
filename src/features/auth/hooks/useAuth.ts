import { useAuthStore } from "../store/useAuthStore";

export const useAuth = () => {
  const {
    user,
    userProfile,
    isLoading,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    refreshProfile,
  } = useAuthStore();

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    refreshProfile,
  };
};
