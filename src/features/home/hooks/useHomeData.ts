import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { useSmartInsights } from "@/src/hooks/useSmartInsights";
import { BudgetService } from "@/src/services/budgetService";
import { TemplateService } from "@/src/services/templateService";
import { TransactionService } from "@/src/services/transactionService";
import { TransactionTemplate } from "@/src/types/template";
import { Transaction } from "@/src/types/transaction";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export const useHomeData = () => {
  const { user } = useAuth();
  const { wallets, isLoading: walletsLoading } = useWallets();
  const { insights, isLoading: insightsLoading } = useSmartInsights();

  // Budget State
  const [safeDaily, setSafeDaily] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState<
    "safe" | "warning" | "danger"
  >("safe");
  const [remainingDays, setRemainingDays] = useState(0);
  const [budgetLoading, setBudgetLoading] = useState(true);

  // Transactions State
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Templates State
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [templateToConfirm, setTemplateToConfirm] = useState<{
    template: TransactionTemplate;
    walletName: string;
  } | null>(null);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  // Subscribe to templates
  useEffect(() => {
    if (!user) return;
    const unsub = TemplateService.subscribeTemplates(user.uid, setTemplates);
    return () => unsub();
  }, [user]);

  // Handle Budget Logic
  useEffect(() => {
    if (!user) return;
    const fetchBudget = async () => {
      const now = new Date();
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const today = now.getDate();
      const left = daysInMonth - today + 1;
      setRemainingDays(left);

      const needs = await BudgetService.calculateMonthlyNeeds(user.uid);
      const disposable = totalBalance - needs;
      const safe = disposable > 0 ? disposable / left : 0;

      setSafeDaily(safe);
      if (safe < 50000) setBudgetStatus("danger");
      else if (safe < 100000) setBudgetStatus("warning");
      else setBudgetStatus("safe");
      setBudgetLoading(false);
    };
    fetchBudget();
  }, [user, totalBalance]);

  // Subscribe to transactions
  useEffect(() => {
    if (!user) return;
    const unsub = TransactionService.subscribeTransactions(user.uid, (data) => {
      const sorted = data.sort((a, b) => b.date - a.date);
      setAllTransactions(sorted);
      setRecentTransactions(sorted.slice(0, 5));
      setLoadingTransactions(false);
    });
    return () => unsub();
  }, [user]);

  const handleUseTemplate = (template: TransactionTemplate) => {
    const wallet = wallets.find((w) => w.id === template.walletId);
    if (!wallet) {
      Toast.show({ type: "error", text1: "Dompet tidak ditemukan" });
      return;
    }
    setTemplateToConfirm({ template, walletName: wallet.name });
    setConfirmVisible(true);
  };

  const handleConfirmTemplate = async () => {
    if (!templateToConfirm || !user) return;

    setConfirmLoading(true);
    const { template } = templateToConfirm;
    try {
      await TransactionService.addTransaction(user.uid, {
        walletId: template.walletId,
        amount: template.amount,
        type: template.type,
        category: template.category,
        classification: "want",
        date: new Date(),
        note: "Transaksi Cepat",
      });
      Toast.show({ type: "success", text1: "Tersimpan!" });
      setConfirmVisible(false);
    } catch (e) {
      Toast.show({ type: "error", text1: "Gagal menyimpan" });
    } finally {
      setConfirmLoading(false);
    }
  };

  return {
    wallets,
    walletsLoading,
    insights,
    insightsLoading,
    totalBalance,

    // Budget
    safeDaily,
    budgetStatus,
    remainingDays,
    budgetLoading,

    // Transactions
    allTransactions,
    recentTransactions,
    loadingTransactions,

    // Templates
    templates,
    templateToConfirm,
    isConfirmVisible,
    setConfirmVisible,
    confirmLoading,
    handleUseTemplate,
    handleConfirmTemplate,
  };
};
