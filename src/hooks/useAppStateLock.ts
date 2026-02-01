import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useSettingsStore } from "@/src/features/settings/store/useSettingsStore";
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useAppStateLock = () => {
  const { user } = useAuthStore();
  const { lock } = useSettingsStore();

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" && user) {
        lock();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [user, lock]);
};
