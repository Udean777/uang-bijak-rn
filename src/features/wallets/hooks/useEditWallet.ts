import { Wallet, WalletType } from "@/src/types/wallet";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useWalletStore } from "../store/useWalletStore";

export const WALLET_COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#1F2937",
];

interface UseEditWalletProps {
  wallet: Wallet | null;
  visible: boolean;
  onClose: () => void;
}

export const useEditWallet = ({
  wallet,
  visible,
  onClose,
}: UseEditWalletProps) => {
  const { updateWallet, isLoading: isStoreLoading } = useWalletStore();

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [selectedType, setSelectedType] = useState<WalletType>("bank");
  const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet && visible) {
      setName(wallet.name);
      setBalance(wallet.balance.toString());
      setSelectedType(wallet.type);
      setSelectedColor(wallet.color);
    }
  }, [wallet, visible]);

  const handleUpdate = useCallback(async () => {
    if (!wallet || !name || !balance) return;

    setIsLoading(true);
    try {
      await updateWallet(wallet.id, {
        name,
        type: selectedType,
        color: selectedColor,
        balance: parseFloat(balance),
      } as any);

      Toast.show({ type: "success", text1: "Dompet Berhasil Diupdate" });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Update",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    wallet,
    name,
    balance,
    selectedType,
    selectedColor,
    updateWallet,
    onClose,
  ]);

  return {
    formState: {
      name,
      balance,
      selectedType,
      selectedColor,
    },
    setters: {
      setName,
      setBalance,
      setSelectedType,
      setSelectedColor,
    },
    isLoading: isLoading || isStoreLoading,
    handleUpdate,
    availableColors: WALLET_COLORS,
  };
};
