import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { ExportService } from "@/src/services/ExportService";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export const useReportsScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Subscribe to transactions
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const unsubscribe = TransactionService.subscribeMonthlyTransactions(
      user.uid,
      selectedMonth,
      selectedYear,
      (data) => {
        setTransactions(data);
        setIsLoading(false);
      },
    );
    return () => unsubscribe();
  }, [user, selectedMonth, selectedYear]);

  // Calculate summary
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const needsTotal = transactions
    .filter((t) => t.type === "expense" && t.classification === "need")
    .reduce((sum, t) => sum + t.amount, 0);

  const wantsTotal = transactions
    .filter((t) => t.type === "expense" && t.classification === "want")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate category breakdown
  const categoryData: CategoryData[] = [];
  const categoryMap: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount], index) => {
      categoryData.push({
        category,
        amount,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      });
    });

  const pieData = categoryData.map((c) => ({
    value: c.amount,
    color: c.color,
    text: c.category,
  }));

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return; // Don't go beyond current month
    }

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleExport = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      await ExportService.exportMonthlySummaryToCSV(
        user.uid,
        selectedYear,
        selectedMonth + 1,
      );
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Export Gagal",
        text2: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isCurrentMonth =
    selectedYear === new Date().getFullYear() &&
    selectedMonth === new Date().getMonth();

  const handleBack = () => router.back();

  return {
    selectedMonth,
    selectedYear,
    transactions,
    isLoading,
    isExporting,
    totalIncome,
    totalExpense,
    needsTotal,
    wantsTotal,
    categoryData,
    pieData,
    goToPreviousMonth,
    goToNextMonth,
    handleExport,
    isCurrentMonth,
    handleBack,
  };
};
