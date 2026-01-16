import { AppText } from "@/src/components/atoms/AppText";
import { Wallet } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface WalletCardProps {
  wallet: Wallet;
  onPress: (wallet: Wallet) => void;
}

export const WalletCard = ({ wallet, onPress }: WalletCardProps) => {
  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const getIcon = () => {
    switch (wallet.type) {
      case "bank":
        return "card-outline";
      case "e-wallet":
        return "phone-portrait-outline";
      case "cash":
        return "cash-outline";
      default:
        return "wallet-outline";
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(wallet)}
      className="mr-4 w-40 h-48 rounded-3xl p-5 justify-between shadow-sm"
      style={{ backgroundColor: wallet.color }}
    >
      <View className="flex-row justify-between items-start">
        <View className="bg-white/20 p-2 rounded-full">
          <Ionicons name={getIcon()} size={20} color="white" />
        </View>
        <AppText className="text-white/80 font-bold uppercase text-[10px] tracking-wider">
          {wallet.type}
        </AppText>
      </View>

      <View>
        <AppText
          className="text-white/90 text-sm font-medium mb-1"
          numberOfLines={1}
        >
          {wallet.name}
        </AppText>
        <AppText
          className="text-white text-xl font-bold"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatRupiah(wallet.balance)}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};
