import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { transactionSchema } from "@/src/schemas/transactionSchema";
import { Category, CategoryService } from "@/src/services/categoryService";
import { TransactionService } from "@/src/services/transactionService";
import { CreateTransactionPayload, Transaction } from "@/src/types/transaction";
import { getErrorMessage } from "@/src/utils/errorUtils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useBudgetStore } from "../../budgets/store/useBudgetStore";
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
  const { addTransaction, updateTransaction, addCategory } =
    useTransactionStore();
  const { budgets, initializeBudgets } = useBudgetStore();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [classification, setClassification] = useState<Classification>("need");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [targetWalletId, setTargetWalletId] = useState<string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editTxId, setEditTxId] = useState<string | null>(null);
  const [oldTxData, setOldTxData] = useState<Transaction | null>(null);

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isBudgetWarningVisible, setBudgetWarningVisible] = useState(false);
  const [budgetWarningData, setBudgetWarningData] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [pendingTxPayload, setPendingTxPayload] =
    useState<CreateTransactionPayload | null>(null);

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
    if (!user) return;
    const now = new Date();
    const unsubscribe = initializeBudgets(
      user.uid,
      now.getMonth(),
      now.getFullYear(),
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  useEffect(() => {
    if (editDataParam) {
      try {
        const data = JSON.parse(editDataParam);
        setIsEditMode(true);
        setEditTxId(data.id);
        setOldTxData(data);

        setAmount(data.amount.toLocaleString("id-ID"));
        setDate(new Date(data.date));
        setType(data.type);
        setCategory(data.category);
        setClassification(data.classification || "need");
        setSelectedWalletId(data.walletId);
        setNote(data.note || "");
        if (data.type === "transfer") {
          setTargetWalletId(data.targetWalletId);
        }
      } catch (error: unknown) {
        console.error("Failed to parse editData", getErrorMessage(error));
      }
    }
  }, [editDataParam]);

  const setFormattedAmount = (val: string) => {
    const numericValue = val.replace(/\D/g, "");
    if (!numericValue) {
      setAmount("");
      return;
    }
    setAmount(parseInt(numericValue).toLocaleString("id-ID"));
  };

  const saveNewCategory = async () => {
    if (!newCategoryName.trim() || !user || type === "transfer") return;
    try {
      await addCategory(user.uid, newCategoryName, type);
      setCategory(newCategoryName);
      setCategoryModalVisible(false);
      setNewCategoryName("");
      Toast.show({ type: "success", text1: "Kategori ditambahkan" });
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: getErrorMessage(error),
      });
    }
  };

  const executeSave = async (payload: CreateTransactionPayload) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && editTxId && oldTxData) {
        await updateTransaction(editTxId, oldTxData, payload);
        Toast.show({ type: "success", text1: "Transaksi Diperbarui" });
        router.dismissAll();
      } else {
        await addTransaction(user!.uid, payload);
        Toast.show({ type: "success", text1: "Transaksi Disimpan" });
        router.back();
      }
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount.replace(/\./g, ""));
    const payload = {
      amount: numericAmount,
      walletId: selectedWalletId,
      type,
      category: type === "transfer" ? undefined : category,
      targetWalletId: type === "transfer" ? targetWalletId : undefined,
      classification: type === "expense" ? classification : null,
      date,
      note,
    };

    const validation = transactionSchema.safeParse(payload);
    if (!validation.success) {
      Toast.show({
        type: "error",
        text1: "Data Belum Lengkap",
        text2: validation.error.issues[0].message,
      });
      return;
    }

    const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
    if (selectedWallet && (type === "expense" || type === "transfer")) {
      if (numericAmount > selectedWallet.balance) {
        Toast.show({
          type: "error",
          text1: "Saldo Tidak Cukup",
          text2: `Saldo ${selectedWallet.name}: Rp${selectedWallet.balance.toLocaleString("id-ID")}`,
        });
        return;
      }
    }

    if (type === "expense" && category && !isEditMode) {
      const budget = budgets.find((b) => b.categoryName === category);
      if (budget) {
        const now = new Date();
        const currentSpending = await TransactionService.getCategorySpending(
          user!.uid,
          category,
          now.getMonth(),
          now.getFullYear(),
        );

        if (currentSpending + numericAmount > budget.limitAmount) {
          setPendingTxPayload(payload);
          setBudgetWarningData({
            title: "Melebihi Budget",
            message: `Total pengeluaran kategori "${category}" akan melebihi budget (Limit: Rp${budget.limitAmount.toLocaleString("id-ID")}). Tetap simpan?`,
          });
          setBudgetWarningVisible(true);
          return;
        }
      }
    }

    await executeSave(payload);
  };

  const onConfirmBudgetWarning = () => {
    setBudgetWarningVisible(false);
    if (pendingTxPayload) {
      executeSave(pendingTxPayload);
      setPendingTxPayload(null);
    }
  };

  const onCancelBudgetWarning = () => {
    setBudgetWarningVisible(false);
    setPendingTxPayload(null);
  };

  return {
    type,
    setType,
    amount,
    setAmount: setFormattedAmount,
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
    date,
    setDate,

    isLoading: isSubmitting,
    isEditMode,
    isCategoryModalVisible,
    setCategoryModalVisible,
    newCategoryName,
    setNewCategoryName,
    wallets,

    isBudgetWarningVisible,
    budgetWarningData,

    handleSave,
    saveNewCategory,
    handleClose: () => router.back(),
    onConfirmBudgetWarning,
    onCancelBudgetWarning,
  };
};
