import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      style={{
        backgroundColor: wallet.color,
        shadowOpacity: isDark ? 0.3 : 0.1,
      }}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start">
        <View className="bg-white/20 p-2 rounded-full">
          <Ionicons name={getIcon()} size={20} color="white" />
        </View>
        <AppText
          color="white"
          weight="bold"
          variant="caption"
          className="uppercase tracking-wider"
        >
          {wallet.type}
        </AppText>
      </View>

      <View>
        <AppText
          color="white"
          weight="medium"
          variant="h3"
          className="mb-1"
          numberOfLines={1}
        >
          {wallet.name}
        </AppText>
        <AppText
          color="white"
          weight="bold"
          variant="h3"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatRupiah(wallet.balance)}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};
