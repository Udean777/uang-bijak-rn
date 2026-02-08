import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import Toast from "react-native-toast-message";
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
    } catch (error: any) {
      console.error("Error processing recurring transactions:", error);

      Toast.show({
        type: "error",
        text1: "Gagal Memproses Transaksi Berulang",
        text2: "Silakan periksa koneksi internet Anda.",
      });
    } finally {
      isProcessing.current = false;
    }
  };
  useEffect(() => {
    process();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        process();
      }
    });

    return () => subscription.remove();
  }, [user]);
};
