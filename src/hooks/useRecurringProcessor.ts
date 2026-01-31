import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useAuth } from "../features/auth/hooks/useAuth";
import { RecurringService } from "../services/recurringService";

/**
 * Hook to automatically process due recurring transactions when app opens or user logs in
 */
export const useRecurringProcessor = () => {
  const { user } = useAuth();
  const isProcessing = useRef(false);

  const process = async () => {
    if (!user || isProcessing.current) return;

    isProcessing.current = true;
    try {
      await RecurringService.processDueTransactions(user.uid);
    } catch (error) {
      console.error("Error processing recurring transactions:", error);
    } finally {
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    // Process on login/startup
    process();

    // Process when app comes back to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        process();
      }
    });

    return () => subscription.remove();
  }, [user]);
};
