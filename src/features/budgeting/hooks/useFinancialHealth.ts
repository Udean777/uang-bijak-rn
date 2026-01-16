import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionService } from "@/src/services/transactionService";
import { useEffect, useState } from "react";

export const useFinancialHealth = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    income: 0,
    needs: 0,
    wants: 0,
    savings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = TransactionService.subscribeTransactions(
      user.uid,
      (transactions) => {
        let totalIncome = 0;
        let totalNeeds = 0;
        let totalWants = 0;

        const now = new Date();
        const thisMonth = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === now.getMonth() &&
            tDate.getFullYear() === now.getFullYear()
          );
        });

        thisMonth.forEach((t) => {
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
              label: "Needs",
            },
            {
              value: totalWants,
              color: "#EF4444",
              text: `${Math.round((totalWants / totalIncome) * 100)}%`,
              label: "Wants",
            },
            {
              value: displaySavings,
              color: "#10B981",
              text: `${Math.round((displaySavings / totalIncome) * 100)}%`,
              label: "Savings",
            },
          ];
          setData(chartData.filter((d) => d.value > 0));
        } else {
          setData([]);
        }

        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { chartData: data, summary, isLoading };
};
