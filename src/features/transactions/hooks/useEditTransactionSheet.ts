import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useTransactionStore } from "@/src/features/transactions/store/useTransactionStore";
import { Category, CategoryService } from "@/src/services/categoryService";
import { Transaction } from "@/src/types/transaction";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

interface UseEditTransactionSheetProps {
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
}

export const useEditTransactionSheet = ({
  transaction,
  visible,
  onClose,
}: UseEditTransactionSheetProps) => {
  const { user } = useAuth();
  const { updateTransaction, isLoading: isStoreLoading } =
    useTransactionStore();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when transaction changes or modal opens
  useEffect(() => {
    if (transaction && visible) {
      setAmount(transaction.amount.toString());
      setNote(transaction.note || "");
      setCategory(transaction.category);
      setSelectedWalletId(transaction.walletId);
    }
  }, [transaction, visible]);

  // Handle category subscription
  useEffect(() => {
    if (user && visible && transaction) {
      const unsub = CategoryService.subscribeCategories(user.uid, (data) => {
        setCategories(data.filter((c) => c.type === transaction.type));
      });
      return () => unsub();
    }
  }, [user, visible, transaction]);

  const handleUpdate = useCallback(async () => {
    if (!transaction || !amount || !selectedWalletId) return;

    setIsLoading(true);
    try {
      await updateTransaction(transaction.id, transaction, {
        amount: parseFloat(amount),
        category,
        note,
        walletId: selectedWalletId,
        type: transaction.type,
        classification: transaction.classification,
        date: new Date(transaction.date),
      } as any);

      Toast.show({ type: "success", text1: "Transaksi Diperbarui" });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Update",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    transaction,
    amount,
    category,
    note,
    selectedWalletId,
    updateTransaction,
    onClose,
  ]);

  return {
    formState: {
      amount,
      note,
      category,
      selectedWalletId,
    },
    setters: {
      setAmount,
      setNote,
      setCategory,
      setSelectedWalletId,
    },
    categories,
    isLoading: isLoading || isStoreLoading,
    handleUpdate,
  };
};
