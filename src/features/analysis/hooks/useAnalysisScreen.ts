import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { useEffect, useMemo, useState } from "react";

export const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

const CHART_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
];

export const useAnalysisScreen = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Subscribe to transactions
  useEffect(() => {
    if (!user) return;
    const unsub = TransactionService.subscribeTransactions(user.uid, (data) => {
      setTransactions(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Filter transactions by current month
  const monthlyData = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth.getMonth() &&
        tDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  }, [transactions, currentMonth]);

  // Calculate totals
  const { totalIncome, totalExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    monthlyData.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
    });
    return { totalIncome: inc, totalExpense: exp };
  }, [monthlyData]);

  // Generate pie chart data
  const pieData = useMemo(() => {
    const expenses = monthlyData.filter((t) => t.type === "expense");
    const grouped: Record<string, number> = {};

    expenses.forEach((t) => {
      if (!grouped[t.category]) grouped[t.category] = 0;
      grouped[t.category] += t.amount;
    });

    const result = Object.keys(grouped).map((cat, index) => ({
      value: grouped[cat],
      color: CHART_COLORS[index % CHART_COLORS.length],
      text: cat,
      label: cat,
    }));

    return result.sort((a, b) => b.value - a.value);
  }, [monthlyData]);

  const changeMonth = (direction: -1 | 1) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const formattedMonth = currentMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return {
    loading,
    currentMonth,
    formattedMonth,
    totalIncome,
    totalExpense,
    pieData,
    changeMonth,
    formatRupiah,
  };
};
