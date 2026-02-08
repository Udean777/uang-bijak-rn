import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { Stack, useSegments } from "expo-router";
import React from "react";
import { View } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import "@/global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BiometricLock } from "../components/organisms/BiometricLock";
import { useAuthStore } from "../features/auth/store/useAuthStore";
import { useSettingsStore } from "../features/settings/store/useSettingsStore";
import { useAppStateLock } from "../hooks/useAppStateLock";
import { useInitializeApp } from "../hooks/useInitializeApp";
import { useNavigationCheck } from "../hooks/useNavigationCheck";
import { useTheme } from "../hooks/useTheme";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function InitialLayout() {
  const { isReady, isMounted, fontsLoaded } = useInitializeApp();
  const { isCheckingPin } = useNavigationCheck(isMounted, fontsLoaded);
  const { isLocked, setIsLocked } = useSettingsStore();
  const { user } = useAuthStore();
  const segments = useSegments();

  useAppStateLock();

  if (!isReady || isCheckingPin) return null;

  const inAuthGroup = segments[0] === "(auth)";
  const inOnboardingGroup = segments[0] === "onboarding";

  if (!user && !inAuthGroup && !inOnboardingGroup) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" />
        <Stack.Screen name="(sub)" />
      </Stack>

      {isLocked && user && (
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
  const { colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <SafeAreaView
          className="flex-1"
          style={{ backgroundColor: colors.background }}
        >
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <InitialLayout />
            <Toast />
          </ThemeProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Wrap with Sentry for error boundary and performance monitoring
export default Sentry.wrap(RootLayout);
