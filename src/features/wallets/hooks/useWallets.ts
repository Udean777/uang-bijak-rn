import { WalletService } from "@/src/services/walletService";
import { Wallet } from "@/src/types/wallet";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";

export const useWallets = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = WalletService.subscribeWallets(user.uid, (data) => {
      setWallets(data);

      const total = data.reduce((acc, curr) => acc + curr.balance, 0);
      setTotalBalance(total);

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { wallets, totalBalance, isLoading };
};
