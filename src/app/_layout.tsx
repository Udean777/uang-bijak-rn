import { Colors } from "@/constants/theme";
import "@/global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus, useColorScheme, View } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { BiometricLock } from "../components/organisms/BiometricLock";
import { initSentry } from "../config/sentry";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useRecurringProcessor } from "../hooks/useRecurringProcessor";
import { SecurityService } from "../services/SecurityService";

// Initialize Sentry at app startup
initSentry();

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

function InitialLayout({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { user, isLoading, hasSeenOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCheckingPin, setIsCheckingPin] = useState(true);

  // Initialize push notifications for bill reminders
  useNotifications();

  // Process recurring transactions
  useRecurringProcessor();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  Sentry.init({
    dsn: "https://be0a4cd2c651724af1ff0cd9de9237c9@o4510798962491392.ingest.us.sentry.io/4510798965506048",

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });

  // 1. Check if user needs to set up PIN
  // 1. Check if user needs to set up PIN or OTP
  useEffect(() => {
    const checkAuthRequirements = async () => {
      // Tunggu sampai user state loaded
      if (!isLoading && user && isMounted) {
        const hasPin = await SecurityService.hasPin();
        const inSetupPin =
          segments[0] === "(auth)" && (segments[1] as string) === "setup-pin";

        if (!hasPin && !inSetupPin) {
          // Force redirect to setup PIN
          router.replace("/(auth)/setup-pin" as any);
        }

        setIsCheckingPin(false);
      } else if (!isLoading && !user) {
        setIsCheckingPin(false);
      }
    };

    checkAuthRequirements();
  }, [user, isLoading, isMounted, segments]);

  useEffect(() => {
    if (!isMounted || isLoading || hasSeenOnboarding === null || !fontsLoaded)
      return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    // Setup PIN screen is part of (auth) but allowed for logged in users
    const inSetupPin = inAuthGroup && (segments[1] as string) === "setup-pin";

    if (user) {
      // If user is logged in, they should generally be in (tabs)
      // UNLESS they are setting up PIN
      if (inAuthGroup && !inSetupPin) {
        // Only redirect to tabs if done with setup
        // The checkAuthRequirements effect handles the enforcement of pin
        // Here we just prevent staying in login/register pages
        router.replace("/(tabs)");
      } else if (inOnboarding) {
        router.replace("/(tabs)");
      }
    } else {
      if (hasSeenOnboarding === true) {
        if (!inAuthGroup) router.replace("/(auth)/login");
      } else {
        if (!inOnboarding) router.replace("/onboarding");
      }
    }
  }, [
    user,
    isLoading,
    isMounted,
    hasSeenOnboarding,
    segments,
    fontsLoaded,
    router,
  ]);

  useEffect(() => {
    if (
      !isLoading &&
      hasSeenOnboarding !== null &&
      fontsLoaded &&
      isMounted &&
      !isCheckingPin
    ) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [
    isLoading,
    hasSeenOnboarding,
    fontsLoaded,
    user,
    segments,
    isMounted,
    isCheckingPin,
  ]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        if (user) {
          const hasPin = await SecurityService.hasPin();
          if (hasPin) {
            setIsLocked(true);
          }
        }
      }
    };
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    // Initial check saat fresh launch
    checkInitialLock();
    return () => {
      subscription.remove();
    };
  }, [user]);

  const checkInitialLock = async () => {
    if (user) {
      const hasPin = await SecurityService.hasPin();
      if (hasPin) {
        setIsLocked(true);
      }
    }
  };

  if (isLoading || hasSeenOnboarding === null || !fontsLoaded || isCheckingPin)
    return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" />
        <Stack.Screen name="(sub)" />
      </Stack>

      {isLocked && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        >
          <BiometricLock onUnlock={() => setIsLocked(false)} />
        </View>
      )}
    </View>
  );
}

function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [loaded] = useFonts({
    JakartaSans: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    JakartaSansBold: require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    JakartaSansExtraBold: require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    JakartaSansSemiBold: require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    JakartaSansMedium: require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    JakartaSansLight: require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
      >
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <InitialLayout fontsLoaded={loaded} />
            <Toast />
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Wrap with Sentry for error boundary and performance monitoring
export default Sentry.wrap(RootLayout);
