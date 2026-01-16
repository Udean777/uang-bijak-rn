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
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { useAuth } from "../features/auth/hooks/useAuth";

SplashScreen.preventAutoHideAsync();

function InitialLayout({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { user, isLoading, hasSeenOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading || hasSeenOnboarding === null || !fontsLoaded)
      return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";
    const inModalsGroup = segments[0] === "(modals)";
    const inSubGroup = segments[0] === "(sub)";

    if (user) {
      if (inAuthGroup || inOnboarding) {
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
    if (!isLoading && hasSeenOnboarding !== null && fontsLoaded && isMounted) {
      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tabs)";
      const inOnboarding = segments[0] === "onboarding";
      const inModalsGroup = segments[0] === "(modals)";
      const inSubGroup = segments[0] === "(sub)";

      const isCorrectRoute =
        (user && (inTabsGroup || inModalsGroup || inSubGroup)) ||
        (!user && hasSeenOnboarding && inAuthGroup) ||
        (!user && !hasSeenOnboarding && inOnboarding);

      if (isCorrectRoute) {
        SplashScreen.hideAsync();
      }
    }
  }, [isLoading, hasSeenOnboarding, fontsLoaded, user, segments, isMounted]);

  if (isLoading || hasSeenOnboarding === null || !fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(modals)" />
      <Stack.Screen name="(sub)" />
    </Stack>
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
