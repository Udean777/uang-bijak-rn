import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { BudgetService } from "../services/budgetService";
import { TransactionService } from "../services/transactionService";
import { CategoryBudget } from "../types/budget";
import { Transaction } from "../types/transaction";

export const useBudgetTracking = (month: number, year: number) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    // 1. Subscribe to Budgets
    const unsubBudgets = BudgetService.subscribeBudgets(user.uid, month, year, (data) => {
      setBudgets(data);
    });

    // 2. Subscribe to Transactions for the month
    const startDate = new Date(year, month, 1).getTime();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

    const unsubTransactions = TransactionService.subscribeTransactions(user.uid, (data) => {
      const filtered = data.filter(t => t.date >= startDate && t.date <= endDate && t.type === 'expense');
      setTransactions(filtered);
      setIsLoading(false);
    });

    return () => {
      unsubBudgets();
      unsubTransactions();
    };
  }, [user, month, year]);

  const budgetWithSpending = budgets.map(budget => {
    const spending = transactions
      .filter(t => t.category === budget.categoryName)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      ...budget,
      currentSpending: spending,
      remaining: budget.limitAmount - spending,
      percentage: Math.min(spending / budget.limitAmount, 1),
    };
  });

  return { budgets: budgetWithSpending, isLoading };
};
