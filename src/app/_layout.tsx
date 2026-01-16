import "@/global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
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

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, segments, isLoading]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />

      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
