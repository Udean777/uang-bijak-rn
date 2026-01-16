import { Wallet } from "@/src/types/wallet";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

interface Props {
  wallet: Wallet;
  onPress: (wallet: Wallet) => void;
}

export const WalletCard: React.FC<Props> = ({ wallet, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(wallet)}
      className="p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm bg-white"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-full justify-center items-center opacity-20"
            style={{ backgroundColor: wallet.color }}
          >
            <View
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: wallet.color, opacity: 1 }}
            />
          </View>

          <View>
            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              {wallet.type}
            </Text>
            <Text className="text-gray-800 text-lg font-bold">
              {wallet.name}
            </Text>
          </View>
        </View>

        <Text className="text-gray-900 text-lg font-semibold">
          {formatRupiah(wallet.balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
