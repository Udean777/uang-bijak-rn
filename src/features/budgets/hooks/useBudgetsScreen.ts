import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useBudgetStore } from "@/src/features/budgets/store/useBudgetStore";
import { useTransactionStore } from "@/src/features/transactions/store/useTransactionStore";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

export const useBudgetsScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    budgets: rawBudgets,
    initializeBudgets,
    setBudget,
    deleteBudget,
    isLoading: isBudgetsLoading,
  } = useBudgetStore();
  const {
    transactions,
    categories: allCategories,
    initializeTransactions,
    initializeCategories,
    isLoading: isTransactionsLoading,
  } = useTransactionStore();

  const now = new Date();
  const [selectedMonth] = useState(now.getMonth());
  const [selectedYear] = useState(now.getFullYear());
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [limit, setLimit] = useState("");

  const categories = useMemo(
    () => allCategories.filter((c) => c.type === "expense"),
    [allCategories],
  );

  const isLoading = isBudgetsLoading || isTransactionsLoading;

  // Initialize Data
  useEffect(() => {
    if (!user) return;
    const unsubBudgets = initializeBudgets(
      user.uid,
      selectedMonth,
      selectedYear,
    );
    const unsubTransactions = initializeTransactions(user.uid);
    const unsubCategories = initializeCategories(user.uid);

    return () => {
      unsubBudgets();
      unsubTransactions();
      unsubCategories();
    };
  }, [user, selectedMonth, selectedYear]);

  // Compute Budgets with Spending
  const budgets = useMemo(() => {
    // Filter transactions for current month range
    const startDate = new Date(selectedYear, selectedMonth, 1).getTime();
    const endDate = new Date(
      selectedYear,
      selectedMonth + 1,
      0,
      23,
      59,
      59,
      999,
    ).getTime();

    const monthlyTransactions = transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate && t.type === "expense",
    );

    return rawBudgets.map((budget) => {
      const spending = monthlyTransactions
        .filter((t) => t.category === budget.categoryName)
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = budget.limitAmount - spending;
      // Prevent division by zero
      const progress =
        budget.limitAmount > 0
          ? Math.min(spending / budget.limitAmount, 1)
          : spending > 0
            ? 1
            : 0;

      return {
        ...budget,
        currentSpending: spending,
        remaining,
        percentage: progress,
      };
    });
  }, [rawBudgets, transactions, selectedMonth, selectedYear]);

  const handleSetBudget = async () => {
    if (!selectedCategory || !limit) {
      Toast.show({
        type: "error",
        text1: "Mohon pilih kategori dan isi limit",
      });
      return;
    }

    try {
      await setBudget(user!.uid, {
        categoryName: selectedCategory,
        limitAmount: parseFloat(limit),
        month: selectedMonth,
        year: selectedYear,
      });
      setAddModalVisible(false);
      setSelectedCategory("");
      setLimit("");
      Toast.show({ type: "success", text1: "Budget berhasil diatur!" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id);
      Toast.show({ type: "success", text1: "Budget dihapus" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleBack = () => router.back();

  return {
    budgets,
    isLoading,
    isSaving: false, // Store doesn't expose isSaving specific, but general isLoading. Can refine later.
    categories,
    isAddModalVisible,
    setAddModalVisible,
    selectedCategory,
    setSelectedCategory,
    limit,
    setLimit,
    handleSetBudget,
    handleDeleteBudget,
    handleBack,
  };
};
