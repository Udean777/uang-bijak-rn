import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { SecurityService } from "@/src/services/SecurityService";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

export const useNavigationCheck = (
  isMounted: boolean,
  fontsLoaded: boolean,
) => {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading: isAuthLoading, hasSeenOnboarding } = useAuthStore();
  const [isCheckingPin, setIsCheckingPin] = useState(true);

  // 1. Check if user needs to set up PIN
  useEffect(() => {
    const checkAuthRequirements = async () => {
      if (!isAuthLoading && user && isMounted) {
        const hasPin = await SecurityService.hasPin();
        const currentPath = segments.join("/");
        const inSetupPin = currentPath.includes("(auth)/setup-pin");

        if (!hasPin && !inSetupPin) {
          router.replace("/(auth)/setup-pin");
        }
        setIsCheckingPin(false);
      } else if (!isAuthLoading && !user) {
        setIsCheckingPin(false);
      }
    };

    checkAuthRequirements();
  }, [user, isAuthLoading, isMounted, segments, router]);

  // 2. Main Navigation Guard
  useEffect(() => {
    if (
      !isMounted ||
      isAuthLoading ||
      hasSeenOnboarding === null ||
      !fontsLoaded ||
      isCheckingPin
    )
      return;

    const currentPath = segments.join("/");
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    const inSetupPin = currentPath.includes("(auth)/setup-pin");

    if (user) {
      // Logic for logged in users
      if (inAuthGroup && !inSetupPin) {
        router.replace("/(tabs)");
      } else if (inOnboarding) {
        router.replace("/(tabs)");
      }
    } else {
      // Logic for guest users
      if (hasSeenOnboarding === true) {
        if (!inAuthGroup) router.replace("/(auth)/login");
      } else {
        if (!inOnboarding) router.replace("/onboarding");
      }
    }
  }, [
    user,
    isAuthLoading,
    isMounted,
    hasSeenOnboarding,
    segments,
    fontsLoaded,
    isCheckingPin,
    router,
  ]);

  return { isCheckingPin };
};
