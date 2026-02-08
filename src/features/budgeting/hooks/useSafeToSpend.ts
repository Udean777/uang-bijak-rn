import { RecurringService } from "@/src/services/recurringService";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { RecurringTransaction } from "@/src/types/recurring";
import { Subscription } from "@/src/types/subscription";
import {
  calculateSafeDailyLimit,
  getSafeStatus,
} from "@/src/utils/financeUtils";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useWallets } from "../../wallets/hooks/useWallets";

export const useSafeToSpend = () => {
  const { user } = useAuth();
  const { totalBalance, isLoading: isWalletLoading } = useWallets();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);

  const [safeDaily, setSafeDaily] = useState(0);
  const [pendingBills, setPendingBills] = useState(0);
  const [status, setStatus] = useState<"safe" | "warning" | "danger">("safe");

  useEffect(() => {
    if (!user) return;

    setIsLoadingData(true);

    const unsubSub = SubscriptionService.subscribeSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data);
      },
    );

    const unsubRec = RecurringService.subscribeRecurring(user.uid, (data) => {
      setRecurrings(data);
    });

    return () => {
      unsubSub();
      unsubRec();
    };
  }, [user]);

  useEffect(() => {
    if (subscriptions || recurrings) {
      setIsLoadingData(false);
    }
  }, [subscriptions, recurrings]);

  useEffect(() => {
    if (isWalletLoading || isLoadingData) return;

    const now = new Date();

    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const remainingDays = lastDayOfMonth.getDate() - now.getDate() + 1;

    const subTotal = SubscriptionService.getPendingBillsTotal(subscriptions);

    let recurringTotal = 0;
    const endOfMonths = lastDayOfMonth.getTime();

    recurrings.forEach((rec) => {
      if (rec.isActive && rec.type !== "income") {
        if (
          rec.nextExecutionDate <= endOfMonths &&
          rec.nextExecutionDate >= now.getTime()
        ) {
          recurringTotal += rec.amount;
        }
      }
    });

    const totalPending = subTotal + recurringTotal;
    setPendingBills(totalPending);

    const dailyLimit = calculateSafeDailyLimit(
      totalBalance,
      totalPending,
      remainingDays,
    );

    setSafeDaily(dailyLimit);
    setStatus(getSafeStatus(dailyLimit));
  }, [totalBalance, isWalletLoading, subscriptions, recurrings, isLoadingData]);

  return {
    safeDaily,
    pendingBills,
    status,
    remainingDays:
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate() -
      new Date().getDate() +
      1,
    isLoading: isWalletLoading || isLoadingData,
  };
};
