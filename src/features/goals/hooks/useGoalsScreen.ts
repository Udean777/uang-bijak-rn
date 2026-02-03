import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useGoalStore } from "@/src/features/goals/store/useGoalStore";
import { useWalletStore } from "@/src/features/wallets/store/useWalletStore";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

export const useGoalsScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    goals: rawGoals,
    initializeGoals,
    addGoal,
    deleteGoal,
    isLoading: isSaving,
  } = useGoalStore();
  const { wallets } = useWalletStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");

  const savingsWallets = useMemo(
    () => wallets.filter((w) => w.type === "savings"),
    [wallets],
  );
  const hasSavingsWallet = savingsWallets.length > 0;

  // Initialize goals
  useEffect(() => {
    if (!user) return;
    const unsubscribe = initializeGoals(user.uid);
    setIsLoading(false); // Optimistic loading state handled by store actually
    return () => unsubscribe();
  }, [user]);

  // Derive goals with current wallet balance
  const goals = useMemo(() => {
    return rawGoals.map((goal) => {
      if (goal.walletId) {
        const wallet = wallets.find((w) => w.id === goal.walletId);
        if (wallet) {
          return { ...goal, currentAmount: wallet.balance };
        }
      }
      return goal;
    });
  }, [rawGoals, wallets]);

  // Auto-select first savings wallet
  useEffect(() => {
    if (hasSavingsWallet && !selectedWalletId) {
      setSelectedWalletId(savingsWallets[0].id);
    }
  }, [hasSavingsWallet, savingsWallets, selectedWalletId]);

  const handleAddGoal = async () => {
    if (!name || !target) {
      Toast.show({ type: "error", text1: "Mohon isi nama dan target dana" });
      return;
    }

    try {
      await addGoal(user!.uid, {
        name,
        targetAmount: parseCurrency(target),
        currentAmount: 0,
        walletId: selectedWalletId,
        color: "#3B82F6",
        icon: "trophy",
      });
      setAddModalVisible(false);
      setName("");
      setTarget("");
      setSelectedWalletId(savingsWallets[0]?.id || "");
      Toast.show({ type: "success", text1: "Goal ditambahkan! 🎯" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      Toast.show({ type: "success", text1: "Goal dihapus" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const handleBack = () => router.back();

  const handleCreateSavingsWallet = () => {
    setAddModalVisible(false);
    router.push({
      pathname: "/(modals)/add-wallet",
      params: { type: "savings" },
    } as any);
  };

  return {
    goals, // Returning the derived goals
    isLoading: useGoalStore.getState().isLoading, // improved
    isSaving,
    isAddModalVisible,
    setAddModalVisible,
    name,
    setName,
    target,
    setTarget,
    selectedWalletId,
    setSelectedWalletId,
    savingsWallets,
    hasSavingsWallet,
    wallets,
    handleAddGoal,
    handleDeleteGoal,
    handleBack,
    handleCreateSavingsWallet,
  };
};
