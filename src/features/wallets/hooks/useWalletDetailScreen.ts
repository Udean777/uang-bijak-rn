import { db } from "@/src/config/firebase";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { Wallet } from "@/src/types/wallet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { useWalletStore } from "../store/useWalletStore";

export const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export const useWalletDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { deleteWallet } = useWalletStore();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const walletId = useMemo(() => {
    if (params.id) return Array.isArray(params.id) ? params.id[0] : params.id;
    if (typeof params.data === "string") {
      try {
        return JSON.parse(params.data).id;
      } catch {
        return null;
      }
    }
    return null;
  }, [params]);

  const [wallet, setWallet] = useState<Wallet | null>(() => {
    if (typeof params.data === "string") {
      try {
        return JSON.parse(params.data);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Subscribe to wallet updates
  useEffect(() => {
    if (!walletId) return;

    const unsub = onSnapshot(
      doc(db, "wallets", walletId),
      (docSnap) => {
        if (docSnap.exists()) {
          setWallet({ id: docSnap.id, ...docSnap.data() } as Wallet);
        } else {
          setWallet(null);
        }
      },
      (error) => {
        console.error("[WalletDetail] Snapshot error:", error);
      },
    );

    return () => unsub();
  }, [walletId]);

  // Subscribe to transactions for this wallet
  useEffect(() => {
    if (!user || !walletId) return;

    const unsub = TransactionService.subscribeTransactions(
      user.uid,
      (allData) => {
        const filtered = allData.filter((t) => t.walletId === walletId);
        setTransactions(filtered);
      },
    );

    return () => unsub();
  }, [user, walletId]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleConfirmDelete = async () => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      await deleteWallet(wallet.id);
      Toast.show({ type: "success", text1: "Dompet dihapus" });
      setShowDeleteDialog(false);
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
      setIsLoading(false);
    }
  };

  const handleTransactionPress = (item: Transaction) => {
    router.push({
      pathname: "/(modals)/transaction-detail",
      params: { data: JSON.stringify(item) },
    });
  };

  // Handle wallet not found
  useEffect(() => {
    if (!wallet && !isLoading) {
      Toast.show({
        type: "error",
        text1: "Data Error",
        text2: "Dompet tidak ditemukan",
      });
      handleBack();
    }
  }, [wallet, isLoading]);

  return {
    wallet,
    transactions,
    isLoading,
    showDeleteDialog,
    setShowDeleteDialog,
    showEditSheet,
    setShowEditSheet,
    handleBack,
    handleConfirmDelete,
    handleTransactionPress,
    formatRupiah,
  };
};
