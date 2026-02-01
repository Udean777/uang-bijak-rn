import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { TransactionService } from "../services/transactionService";
import { SmartInsight } from "../types/insight";
import { useBudgetTracking } from "./useBudgetTracking";

export const useSmartInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get budget status (already implemented in Phase 4)
  const { budgets } = useBudgetTracking(currentMonth, currentYear);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    const unsub = TransactionService.subscribeTransactions(
      user.uid,
      (allTxs) => {
        const newInsights: SmartInsight[] = [];

        // 1. Check Budget Overruns (from useBudgetTracking)
        budgets.forEach((b) => {
          if (b.percentage >= 1) {
            newInsights.push({
              id: `budget-over-${b.id}`,
              type: "danger",
              title: "Over Budget!",
              message: `Pengeluaran ${b.categoryName} sudah melebihi limit Rp ${b.limitAmount.toLocaleString("id-ID")}.`,
              icon: "alert-circle",
              category: b.categoryName,
            });
          } else if (b.percentage >= 0.8) {
            newInsights.push({
              id: `budget-near-${b.id}`,
              type: "warning",
              title: "Hampir Limit",
              message: `Pengeluaran ${b.categoryName} sudah mencapai ${Math.round(b.percentage * 100)}% dari budget.`,
              icon: "warning",
              category: b.categoryName,
            });
          }
        });

        // 2. Compare with Previous Month Spending
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const startPrev = new Date(prevYear, prevMonth, 1).getTime();
        const endPrev = new Date(
          prevYear,
          prevMonth + 1,
          0,
          23,
          59,
          59,
        ).getTime();
        const startCurr = new Date(currentYear, currentMonth, 1).getTime();

        const prevTxs = allTxs.filter(
          (t) =>
            t.type === "expense" && t.date >= startPrev && t.date <= endPrev,
        );
        const currTxs = allTxs.filter(
          (t) => t.type === "expense" && t.date >= startCurr,
        );

        const prevTotal = prevTxs.reduce((sum, t) => sum + t.amount, 0);
        const currTotal = currTxs.reduce((sum, t) => sum + t.amount, 0);

        // Overall spending trend
        if (currTotal > prevTotal && prevTotal > 0) {
          const increase = ((currTotal - prevTotal) / prevTotal) * 100;
          if (increase > 20) {
            newInsights.push({
              id: "trend-up",
              type: "info",
              title: "Tren Pengeluaran Naik",
              message: `Pengeluaranmu bulan ini sudah ${Math.round(increase)}% lebih tinggi dibanding bulan lalu.`,
              icon: "trending-up",
            });
          }
        }

        // Category-specific spike
        const categories = Array.from(new Set(allTxs.map((t) => t.category)));
        categories.forEach((cat) => {
          const pCatTotal = prevTxs
            .filter((t) => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
          const cCatTotal = currTxs
            .filter((t) => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);

          if (cCatTotal > pCatTotal * 1.5 && pCatTotal > 50000) {
            newInsights.push({
              id: `spike-${cat}`,
              type: "warning",
              title: `Lonjakan di ${cat}`,
              message: `Kamu belanja ${cat} jauh lebih banyak bulan ini dibanding biasanya.`,
              icon: "flash",
              category: cat,
            });
          }
        });

        setInsights(newInsights);
        setIsLoading(false);
      },
    );

    return () => unsub();
  }, [user, budgets.length]); // Re-run when budgets are loaded

  return { insights, isLoading };
};
