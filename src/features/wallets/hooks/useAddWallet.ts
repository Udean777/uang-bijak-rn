import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
import { WalletType } from "@/src/types/wallet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useWalletStore } from "../store/useWalletStore";

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#1F2937",
];

export const useAddWallet = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: WalletType }>();
  const { user } = useAuthStore();
  const { createWallet, isLoading } = useWalletStore();

  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [selectedType, setSelectedType] = useState<WalletType>(
    params.type || "bank",
  );
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleBalanceChange = (val: string) => {
    // We can just set the state as CurrencyInput handles formatting,
    // but assuming useAddWallet uses AppInput (which was replaced by CurrencyInput in add-wallet.tsx)
    // Actually add-wallet.tsx uses CurrencyInput now, so initialBalance is already formatted.
    // So handleBalanceChange might be redundant or just need to pass through?
    // Wait, add-wallet.tsx passes onChangeText={setInitialBalance} directly?
    // Let's check add-wallet.tsx from previous context.
    // Yes, Step 268 said "Replaced AppInput ... with CurrencyInput".
    // So in useAddWallet, we should just expect formatted string.
    // But useAddWallet exports handleBalanceChange?
    // Let's assume for now we just want to parse correctly in handleSave.
    setInitialBalance(val);
  };

  const handleSave = async () => {
    if (!name || !initialBalance) {
      Toast.show({
        type: "error",
        text1: "Mohon Lengkapi Data",
        text2: "Nama dan Saldo wajib diisi.",
      });
      return;
    }

    try {
      await createWallet(user!.uid, {
        name,
        type: selectedType,
        initialBalance: parseCurrency(initialBalance),
        color: selectedColor,
      });

      Toast.show({
        type: "success",
        text1: "Berhasil!",
        text2: "Dompet baru telah dibuat.",
      });

      router.back();
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    }
  };

  return {
    name,
    setName,
    initialBalance,
    handleBalanceChange,
    selectedType,
    setSelectedType,
    selectedColor,
    setSelectedColor,
    isLoading,
    handleSave,
    colors: COLORS,
  };
};
