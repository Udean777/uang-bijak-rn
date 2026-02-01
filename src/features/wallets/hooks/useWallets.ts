import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useEffect } from "react";
import { useWalletStore } from "../store/useWalletStore";

export const useWallets = () => {
  const { user } = useAuthStore();
  const {
    wallets,
    totalBalance,
    totalDebt,
    netWorth,
    isLoading,
    initializeWallets,
  } = useWalletStore();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = initializeWallets(user.uid);
    return () => unsubscribe();
  }, [user]);

  return { wallets, totalBalance, totalDebt, netWorth, isLoading };
};
