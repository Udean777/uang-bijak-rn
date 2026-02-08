import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useSettingsStore } from "@/src/features/settings/store/useSettingsStore";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useRecurringProcessor } from "@/src/hooks/useRecurringProcessor";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export const useInitializeApp = () => {
  const { initializeAuth, isInitialized, hasSeenOnboarding } = useAuthStore();

  const { initializeSettings } = useSettingsStore();
  const [isMounted, setIsMounted] = useState(false);

  const [fontsLoaded] = useFonts({
    JakartaSans: require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    JakartaSansBold: require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    JakartaSansExtraBold: require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    JakartaSansSemiBold: require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    JakartaSansMedium: require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    JakartaSansLight: require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useNotifications();
  useRecurringProcessor();

  useEffect(() => {
    setIsMounted(true);
    const unsubAuth = initializeAuth();
    initializeSettings();

    Sentry.init({
      dsn: "https://be0a4cd2c651724af1ff0cd9de9237c9@o4510798962491392.ingest.us.sentry.io/4510798965506048",
      sendDefaultPii: true,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      integrations: [
        Sentry.mobileReplayIntegration(),
        Sentry.feedbackIntegration(),
      ],
    });

    return () => {
      unsubAuth();
    };
  }, [initializeAuth, initializeSettings]);

  useEffect(() => {
    const hideSplash = async () => {
      if (
        isMounted &&
        fontsLoaded &&
        isInitialized &&
        hasSeenOnboarding !== null
      ) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Error hiding splash screen:", e);
        }
      }
    };

    hideSplash();
  }, [isMounted, fontsLoaded, isInitialized, hasSeenOnboarding]);

  return {
    isMounted,
    fontsLoaded,
    isReady:
      isMounted && fontsLoaded && isInitialized && hasSeenOnboarding !== null,
  };
};
