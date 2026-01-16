import "@/global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/molecules/ToastConfig";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { useAuth } from "../features/auth/hooks/useAuth";

const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1">
      <AuthProvider>
        <MainLayout />
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaView>
  );
}
