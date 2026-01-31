import { useEffect, useState } from "react";
import { useWallets } from "../../wallets/hooks/useWallets";
import { useAuth } from "../../auth/hooks/useAuth";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { Subscription } from "@/src/types/subscription";
import { calculateSafeDailyLimit, getSafeStatus } from "@/src/utils/financeUtils";

export const useSafeToSpend = () => {
  const { user } = useAuth();
  const { totalBalance, isLoading: isWalletLoading } = useWallets();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isSubLoading, setIsSubLoading] = useState(true);
  const [safeDaily, setSafeDaily] = useState(0);
  const [pendingBills, setPendingBills] = useState(0);
  const [status, setStatus] = useState<"safe" | "warning" | "danger">("safe");

  // Subscribe to subscriptions
  useEffect(() => {
    if (!user) return;

    setIsSubLoading(true);
    const unsubscribe = SubscriptionService.subscribeSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data);
        setIsSubLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Calculate safe-to-spend
  useEffect(() => {
    if (isWalletLoading || isSubLoading) return;

    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const remainingDays = lastDayOfMonth.getDate() - now.getDate() + 1; // +1 to include today

    const billsTotal = SubscriptionService.getPendingBillsTotal(subscriptions);
    setPendingBills(billsTotal);

    const dailyLimit = calculateSafeDailyLimit(totalBalance, billsTotal, remainingDays);
    setSafeDaily(dailyLimit);
    setStatus(getSafeStatus(dailyLimit));
  }, [totalBalance, isWalletLoading, subscriptions, isSubLoading]);

  return {
    safeDaily,
    pendingBills,
    status,
    remainingDays:
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate() - new Date().getDate() + 1,
    isLoading: isWalletLoading || isSubLoading,
  };
};
