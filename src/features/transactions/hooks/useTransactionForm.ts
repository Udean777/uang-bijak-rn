import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { Category, CategoryService } from "@/src/services/categoryService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useWalletStore } from "../../wallets/store/useWalletStore";
import { useTransactionStore } from "../store/useTransactionStore";

export type TransactionType = "income" | "expense" | "transfer";
export type Classification = "need" | "want";

interface UseTransactionFormProps {
  editDataParam?: string;
}

export const useTransactionForm = ({
  editDataParam,
}: UseTransactionFormProps = {}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallets } = useWalletStore();
  const { addTransaction, updateTransaction, addCategory, isLoading } =
    useTransactionStore();

  // Basic Form State
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [classification, setClassification] = useState<Classification>("need");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [targetWalletId, setTargetWalletId] = useState<string>("");
  const [note, setNote] = useState("");

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTxId, setEditTxId] = useState<string | null>(null);
  const [oldTxData, setOldTxData] = useState<any>(null);

  // Category Modal State
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubscribe = CategoryService.subscribeCategories(
      user.uid,
      (data) => {
        setCategories(data);
        if (data.length > 0 && !category) {
          const defaultCat = data.find((c) => c.type === type) || data[0];
          setCategory(defaultCat.name);
        }
      },
    );

    return () => unsubscribe();
  }, [user, type]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  // Handle Edit Mode Initialization
  useEffect(() => {
    if (editDataParam) {
      try {
        const data = JSON.parse(editDataParam);
        setIsEditMode(true);
        setEditTxId(data.id);
        setOldTxData(data);
        const formattedAmount = data.amount.toLocaleString("id-ID");
        setAmount(formattedAmount);
        setType(data.type);
        setCategory(data.category);
        setClassification(data.classification || "need");
        setSelectedWalletId(data.walletId);
        setNote(data.note || "");
      } catch (e) {
        console.error("Gagal parse editData", e);
      }
    }
  }, [editDataParam]);

  const saveNewCategory = async () => {
    if (!newCategoryName.trim() || !user || type === "transfer") return;

    try {
      await addCategory(user.uid, newCategoryName, type);
      setCategory(newCategoryName);
      setCategoryModalVisible(false);
      setNewCategoryName("");
      Toast.show({ type: "success", text1: "Kategori ditambahkan" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Gagal menambah kategori" });
    }
  };

  const handleSave = async () => {
    if (!amount || !selectedWalletId) {
      Toast.show({
        type: "error",
        text1: "Data Belum Lengkap",
        text2: "Mohon isi nominal dan pilih dompet.",
      });
      return;
    }

    if (type === "transfer" && !targetWalletId) {
      Toast.show({
        type: "error",
        text1: "Data Belum Lengkap",
        text2: "Mohon pilih dompet tujuan.",
      });
      return;
    }

    try {
      // Parse amount (remove thousand separators)
      const rawAmount = amount.replace(/\./g, "");

      const payload = {
        walletId: selectedWalletId,
        targetWalletId: type === "transfer" ? targetWalletId : undefined,
        amount: parseFloat(rawAmount),
        type,
        category: type === "transfer" ? "Transfer" : category,
        classification: type === "expense" ? classification : null,
        date: new Date(),
        note,
      };

      if (isEditMode && editTxId && oldTxData) {
        await updateTransaction(editTxId, oldTxData, payload as any);
        Toast.show({ type: "success", text1: "Transaksi Diperbarui" });
        router.dismissAll();
      } else {
        await addTransaction(user!.uid, payload as any);
        Toast.show({ type: "success", text1: "Transaksi Disimpan" });
        router.back();
      }
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    }
  };

  return {
    // States
    type,
    setType,
    amount,
    setAmount: (val: string) => {
      // Strip non-numeric
      const numericValue = val.replace(/\D/g, "");
      if (!numericValue) {
        setAmount("");
        return;
      }
      // Format with dots
      const formatted = parseInt(numericValue).toLocaleString("id-ID");
      setAmount(formatted);
    },
    category,
    setCategory,
    categories,
    classification,
    setClassification,
    selectedWalletId,
    setSelectedWalletId,
    targetWalletId,
    setTargetWalletId,
    note,
    setNote,
    isLoading,
    isEditMode,
    isCategoryModalVisible,
    setCategoryModalVisible,
    newCategoryName,
    setNewCategoryName,
    wallets,

    // Actions
    handleSave,
    saveNewCategory,
    handleClose: () => router.back(),
  };
};
