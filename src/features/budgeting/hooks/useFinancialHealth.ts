import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionService } from "@/src/services/transactionService";
import { useEffect, useState } from "react";

interface ChartItem {
  value: number;
  color: string;
  text: string;
  label: string;
}

interface BarItem {
  value: number;
  label: string;
  frontColor: string;
  spacing?: number;
  labelTextStyle: { color: string; fontSize: number };
}

export const useFinancialHealth = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ChartItem[]>([]);
  const [summary, setSummary] = useState({
    income: 0,
    needs: 0,
    wants: 0,
    savings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [barData, setBarData] = useState<BarItem[]>([]);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const unsubscribe = TransactionService.subscribeMonthlyTransactions(
      user.uid,
      month,
      year,
      (transactions) => {
        let totalIncome = 0;
        let totalNeeds = 0;
        let totalWants = 0;

        transactions.forEach((t) => {
          if (t.type === "income") {
            totalIncome += t.amount;
          } else if (t.type === "expense") {
            if (t.classification === "need") totalNeeds += t.amount;
            else if (t.classification === "want") totalWants += t.amount;
          }
        });

        const totalExpense = totalNeeds + totalWants;
        const totalSavings = totalIncome - totalExpense;
        const displaySavings = totalSavings > 0 ? totalSavings : 0;

        const incomeBar = {
          value: totalIncome,
          label: "Pemasukan",
          frontColor: "#10B981",
          spacing: 20,
          labelTextStyle: { color: "gray", fontSize: 12 },
        };

        const expenseBar = {
          value: totalExpense,
          label: "Keluar",
          frontColor: "#EF4444",
          labelTextStyle: { color: "gray", fontSize: 12 },
        };

        setBarData([incomeBar, expenseBar]);

        setSummary({
          income: totalIncome,
          needs: totalNeeds,
          wants: totalWants,
          savings: totalSavings,
        });

        if (totalIncome > 0) {
          const chartData = [
            {
              value: totalNeeds,
              color: "#3B82F6",
              text: `${Math.round((totalNeeds / totalIncome) * 100)}%`,
              label: "Kebutuhan",
            },
            {
              value: totalWants,
              color: "#EF4444",
              text: `${Math.round((totalWants / totalIncome) * 100)}%`,
              label: "Keinginan",
            },
            {
              value: displaySavings,
              color: "#10B981",
              text: `${Math.round((displaySavings / totalIncome) * 100)}%`,
              label: "Tabungan",
            },
          ];

          setData(chartData.filter((d) => d.value > 0));
        } else {
          setData([]);
        }

        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  return { chartData: data, barData, summary, isLoading };
};
