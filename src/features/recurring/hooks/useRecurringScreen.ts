import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useRecurringStore } from "@/src/features/recurring/store/useRecurringStore";
import { useTransactionStore } from "@/src/features/transactions/store/useTransactionStore";
import { useWalletStore } from "@/src/features/wallets/store/useWalletStore";
import { RecurringFrequency } from "@/src/types/recurring";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

export const useRecurringScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallets } = useWalletStore();
  const {
    recurring,
    isLoading: isRecurringLoading,
    initializeRecurring,
    addRecurring,
    deleteRecurring,
    toggleActive,
  } = useRecurringStore();
  const {
    categories,
    initializeCategories,
    isLoading: isCategoriesLoading,
  } = useTransactionStore();

  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Form State
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [walletId, setWalletId] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [note, setNote] = useState("");

  const isLoading = isRecurringLoading || isCategoriesLoading;

  // Initialize Data
  useEffect(() => {
    if (!user) return;
    const unsubRecurring = initializeRecurring(user.uid);
    const unsubCategories = initializeCategories(user.uid);
    return () => {
      unsubRecurring();
      unsubCategories();
    };
  }, [user]);

  // Auto-select first wallet
  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const resetForm = () => {
    setAmount("");
    setNote("");
    setCategory("");
    if (wallets.length > 0) setWalletId(wallets[0].id);
  };

  const handleAddRecurring = async () => {
    if (!amount || !category || !walletId) {
      Toast.show({ type: "error", text1: "Mohon lengkapi data" });
      return;
    }

    try {
      await addRecurring(user!.uid, {
        walletId,
        amount: parseFloat(amount),
        type,
        category,
        frequency,
        startDate: new Date(),
        note,
      });
      setAddModalVisible(false);
      resetForm();
      Toast.show({ type: "success", text1: "Transaksi berulang ditambahkan!" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      await deleteRecurring(id);
      Toast.show({ type: "success", text1: "Transaksi dihapus" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleActive(id, isActive);
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleBack = () => router.back();

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  return {
    recurring,
    isLoading,
    isSaving: false,
    categories: filteredCategories,
    wallets,
    isAddModalVisible,
    setAddModalVisible,
    type,
    setType,
    amount,
    setAmount,
    category,
    setCategory,
    walletId,
    setWalletId,
    frequency,
    setFrequency,
    note,
    setNote,
    handleAddRecurring,
    handleDeleteRecurring,
    handleToggleActive,
    handleBack,
  };
};
