import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useTransactionStore } from "@/src/features/transactions/store/useTransactionStore";
import { useWalletStore } from "@/src/features/wallets/store/useWalletStore";
import { Subscription } from "@/src/types/subscription";
import { getErrorMessage } from "@/src/utils/errorUtils";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useSubscriptionStore } from "../store/useSubscriptionStore";

export const useSubscriptionList = () => {
  const { user } = useAuthStore();
  const {
    subscriptions,
    isLoading: isSubsLoading,
    deleteSubscription,
    renewSubscription,
    initializeSubscriptions,
  } = useSubscriptionStore();
  const { wallets } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const unsub = initializeSubscriptions(user.uid);
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  const sortedSubs = [...subscriptions].sort(
    (a, b) => (a.nextPaymentDate || 0) - (b.nextPaymentDate || 0),
  );

  const handleConfirmPay = async () => {
    if (!user || !selectedSub || !selectedWalletId) return;

    try {
      await addTransaction(user.uid, {
        amount: selectedSub.cost,
        category: "Tagihan",
        classification: "need",
        date: new Date(),
        note: `Bayar Langganan: ${selectedSub.name}`,
        type: "expense",
        walletId: selectedWalletId,
      });

      const currentNextDate = selectedSub.nextPaymentDate || Date.now();
      await renewSubscription(
        selectedSub.id,
        currentNextDate,
        selectedSub.dueDate,
      );

      Toast.show({
        type: "success",
        text1: "Tagihan Lunas!",
        text2: "Jadwal diperbarui ke bulan depan.",
      });
      setPayModalVisible(false);
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: getErrorMessage(error),
      });
    }
  };

  const onPayPress = (sub: Subscription) => {
    setSelectedSub(sub);
    setPayModalVisible(true);
  };

  const onDeletePress = (sub: Subscription) => {
    setSubToDelete(sub);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subToDelete) return;
    setIsProcessing(true);
    try {
      await deleteSubscription(subToDelete.id);
      Toast.show({ type: "success", text1: "Berhasil Dihapus" });
      setShowDeleteDialog(false);
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: getErrorMessage(error),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalCost = subscriptions.reduce((acc, curr) => acc + curr.cost, 0);

  return {
    subscriptions: sortedSubs,
    isLoading: isSubsLoading,
    payModalVisible,
    setPayModalVisible,
    selectedSub,
    selectedWalletId,
    setSelectedWalletId,
    showDeleteDialog,
    setShowDeleteDialog,
    subToDelete,
    isProcessing,
    wallets,
    totalCost,
    onPayPress,
    onDeletePress,
    handleConfirmPay,
    handleDeleteConfirm,
  };
};
