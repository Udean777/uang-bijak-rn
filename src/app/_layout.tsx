import { Colors } from "@/constants/theme";
import "@/global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
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
import { AuthProvider } from "../features/auth/context/AuthContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { SecurityService } from "../services/SecurityService";

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Check if user needs to set up PIN
  useEffect(() => {
    const checkPinRequirement = async () => {
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

    checkPinRequirement();
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

export default function RootLayout() {
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
