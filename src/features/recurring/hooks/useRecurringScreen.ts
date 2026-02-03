import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useRecurringStore } from "@/src/features/recurring/store/useRecurringStore";
import { useTransactionStore } from "@/src/features/transactions/store/useTransactionStore";
import { useWalletStore } from "@/src/features/wallets/store/useWalletStore";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
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

  // Dialog State
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [recurringToDelete, setRecurringToDelete] = useState<string | null>(
    null,
  );

  // Edit State
  const [editingRecurring, setEditingRecurring] = useState<any | null>(null);

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
    if (wallets.length > 0 && !walletId && !editingRecurring) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId, editingRecurring]);

  const resetForm = () => {
    setAmount("");
    setNote("");
    setCategory("");
    setFrequency("monthly");
    setType("expense");
    setEditingRecurring(null);
    if (wallets.length > 0) setWalletId(wallets[0].id);
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const handleEditRecurring = (item: any) => {
    setEditingRecurring(item);
    setAmount(item.amount.toLocaleString("id-ID"));
    setType(item.type);
    setCategory(item.category);
    setWalletId(item.walletId);
    setFrequency(item.frequency);
    setNote(item.note || "");
    setAddModalVisible(true);
  };

  const handleSaveRecurring = async () => {
    if (!amount || !category || !walletId) {
      Toast.show({ type: "error", text1: "Mohon lengkapi data" });
      return;
    }

    try {
      if (editingRecurring) {
        // UPDATE
        await useRecurringStore
          .getState()
          .updateRecurring(editingRecurring.id, {
            walletId,
            amount: parseCurrency(amount),
            type,
            category,
            frequency,
            // Optimization: Only update startDate if necessary logic is decided.
            // For now we keep original start date unless we want to reset.
            // Let's assume editing doesn't require resetting start date for now unless extensive UI supports it.
            note,
          });
        Toast.show({ type: "success", text1: "Transaksi diperbarui! ✏️" });
      } else {
        // CREATE
        await addRecurring(user!.uid, {
          walletId,
          amount: parseCurrency(amount),
          type,
          category,
          frequency,
          startDate: new Date(),
          note,
        });
        Toast.show({
          type: "success",
          text1: "Transaksi berulang ditambahkan!",
        });
      }
      setAddModalVisible(false);
      resetForm();
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleDeletePress = (id: string) => {
    setRecurringToDelete(id);
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!recurringToDelete) return;
    try {
      await deleteRecurring(recurringToDelete);
      Toast.show({ type: "success", text1: "Transaksi dihapus" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    } finally {
      setConfirmDeleteVisible(false);
      setRecurringToDelete(null);
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
    handleSaveRecurring, // Renamed from handleAddRecurring
    handleDeletePress,
    handleEditRecurring,
    handleConfirmDelete,
    confirmDeleteVisible,
    setConfirmDeleteVisible,
    handleToggleActive,
    handleBack,
    handleOpenAdd,
    editingRecurring,
  };
};
