import { db } from "@/src/config/firebase";
import { Transaction } from "@/src/types/transaction";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { useWalletStore } from "../../wallets/store/useWalletStore";
import { useTransactionStore } from "../store/useTransactionStore";

export const useTransactionDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deleteTransaction } = useTransactionStore();
  const { wallets } = useWalletStore();

  const initialTransaction = useMemo(() => {
    if (params.data && typeof params.data === "string") {
      try {
        return JSON.parse(params.data);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.data]);

  const [transaction, setTransaction] = useState<Transaction | null>(
    initialTransaction,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  // Get wallet name from store instead of fetching
  const walletName = useMemo(() => {
    if (!transaction?.walletId) return "Memuat...";
    const wallet = wallets.find((w) => w.id === transaction.walletId);
    return wallet?.name || "Dompet Terhapus";
  }, [transaction?.walletId, wallets]);

  // Subscribe to transaction changes
  useEffect(() => {
    if (!initialTransaction?.id) return;
    const unsub = onSnapshot(
      doc(db, "transactions", initialTransaction.id),
      (docSnap) => {
        if (docSnap.exists()) {
          setTransaction({ id: docSnap.id, ...docSnap.data() } as Transaction);
        } else {
          setTransaction(null);
        }
      },
      (error) => {
        console.error("[TransactionDetail] Snapshot error:", error);
      },
    );
    return () => unsub();
  }, [initialTransaction?.id]);

  const handleDelete = async () => {
    if (!transaction) return;
    setIsLoading(true);
    try {
      await deleteTransaction(transaction.id, transaction);
      Toast.show({
        type: "success",
        text1: "Transaksi Dihapus",
        text2: "Saldo dikembalikan.",
      });
      router.back();
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => router.back();

  return {
    transaction,
    walletName,
    isLoading,
    showDeleteDialog,
    setShowDeleteDialog,
    showEditSheet,
    setShowEditSheet,
    handleDelete,
    handleBack,
  };
};
