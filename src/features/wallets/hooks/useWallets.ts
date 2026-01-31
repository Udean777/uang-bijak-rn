import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { WalletService } from "@/src/services/walletService";
import { Wallet } from "@/src/types/wallet";
import { useEffect, useState } from "react";

export const useWallets = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = WalletService.subscribeWallets(user.uid, (data) => {
      setWallets(data);

      // Calculate total balance (excluding credit cards)
      const availableFunds = data
        .filter((w) => w.type !== "credit-card")
        .reduce((acc, curr) => acc + curr.balance, 0);
      setTotalBalance(availableFunds);

      // Calculate total credit card debt (credit card balances represent debt owed)
      const creditCardDebt = data
        .filter((w) => w.type === "credit-card")
        .reduce((acc, curr) => acc + curr.balance, 0);
      setTotalDebt(creditCardDebt);

      // Net worth = available funds - debt
      setNetWorth(availableFunds - creditCardDebt);

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { wallets, totalBalance, totalDebt, netWorth, isLoading };
};
