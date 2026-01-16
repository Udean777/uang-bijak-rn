import { AppText } from "@/src/components/atoms/AppText";
import { Wallet } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

interface Props {
  wallet: Wallet;
  onPress?: (wallet: Wallet) => void;
}

export const WalletCard: React.FC<Props> = ({ wallet, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(wallet)}
      activeOpacity={0.7}
      className="mb-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex-row justify-between items-center"
    >
      <View className="flex-row items-center gap-4">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center opacity-90"
          style={{ backgroundColor: wallet.color }}
        >
          <Ionicons name="wallet" size={24} color="white" />
        </View>

        <View>
          <AppText
            variant="caption"
            color="secondary"
            className="uppercase tracking-wider"
          >
            {wallet.type}
          </AppText>
          <AppText variant="body" weight="bold" className="text-gray-900">
            {wallet.name}
          </AppText>
        </View>
      </View>

      <AppText variant="h3" weight="bold" color="primary">
        {formatRupiah(wallet.balance)}
      </AppText>
    </TouchableOpacity>
  );
};
