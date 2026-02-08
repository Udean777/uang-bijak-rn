import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useGoalStore } from "@/src/features/goals/store/useGoalStore";
import { useWalletStore } from "@/src/features/wallets/store/useWalletStore";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
import { Goal } from "@/src/types/goal";
import { getErrorMessage } from "@/src/utils/errorUtils";
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

  // Dialog State
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  // Edit State
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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
    if (hasSavingsWallet && !selectedWalletId && !editingGoal) {
      setSelectedWalletId(savingsWallets[0].id);
    }
  }, [hasSavingsWallet, savingsWallets, selectedWalletId, editingGoal]);

  const resetForm = () => {
    setName("");
    setTarget("");
    setSelectedWalletId(savingsWallets[0]?.id || "");
    setEditingGoal(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTarget(goal.targetAmount.toLocaleString("id-ID"));
    setSelectedWalletId(goal.walletId || "");
    setAddModalVisible(true);
  };

  const handleSaveGoal = async () => {
    if (!name || !target) {
      Toast.show({ type: "error", text1: "Mohon isi nama dan target dana" });
      return;
    }

    try {
      if (editingGoal) {
        // UPDATE MODE
        await useGoalStore.getState().updateGoal(editingGoal.id, {
          name,
          targetAmount: parseCurrency(target),
          walletId: selectedWalletId,
        });
        Toast.show({ type: "success", text1: "Goal diperbarui! ✏️" });
      } else {
        // CREATE MODE
        await addGoal(user!.uid, {
          name,
          targetAmount: parseCurrency(target),
          currentAmount: 0,
          walletId: selectedWalletId,
          color: "#3B82F6",
          icon: "trophy",
        });
        Toast.show({ type: "success", text1: "Goal ditambahkan! 🎯" });
      }
      setAddModalVisible(false);
      resetForm();
    } catch (error: unknown) {
      Toast.show({ type: "error", text1: getErrorMessage(error) });
    }
  };

  const handleDeletePress = (goalId: string) => {
    setGoalToDelete(goalId);
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      await deleteGoal(goalToDelete);
      Toast.show({ type: "success", text1: "Goal dihapus" });
    } catch (error: unknown) {
      Toast.show({ type: "error", text1: getErrorMessage(error) });
    } finally {
      setConfirmDeleteVisible(false);
      setGoalToDelete(null);
    }
  };

  const handleBack = () => router.back();

  const handleCreateSavingsWallet = () => {
    setAddModalVisible(false);
    router.push({
      pathname: "/(modals)/add-wallet",
      params: { type: "savings" },
    });
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
    handleSaveGoal,
    handleDeletePress,
    handleEditGoal,
    handleConfirmDelete,
    confirmDeleteVisible,
    setConfirmDeleteVisible,
    handleBack,
    handleCreateSavingsWallet,
    handleOpenAdd,
    editingGoal,
  };
};
