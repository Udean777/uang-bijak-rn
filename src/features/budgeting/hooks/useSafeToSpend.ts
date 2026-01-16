import { useEffect, useState } from "react";
import { useWallets } from "../../wallets/hooks/useWallets";

export const useSafeToSpend = () => {
  const { totalBalance, isLoading: isWalletLoading } = useWallets();
  const [safeDaily, setSafeDaily] = useState(0);
  const [status, setStatus] = useState<"safe" | "warning" | "danger">("safe");

  useEffect(() => {
    if (isWalletLoading) return;

    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const remainingDays = lastDayOfMonth.getDate() - now.getDate();

    const divisor = remainingDays === 0 ? 1 : remainingDays;

    const pendingBills = 0;
    const availableFunds = totalBalance - pendingBills;
    const dailyLimit = availableFunds / divisor;

    setSafeDaily(dailyLimit);

    if (dailyLimit < 50000) setStatus("danger");
    else if (dailyLimit < 100000) setStatus("warning");
    else setStatus("safe");
  }, [totalBalance, isWalletLoading]);

  return {
    safeDaily,
    status,
    remainingDays:
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate() - new Date().getDate(),
    isLoading: isWalletLoading,
  };
};
