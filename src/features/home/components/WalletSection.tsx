import { AppText } from "@/src/components/atoms/AppText";
import { WalletCard } from "@/src/features/wallets/components/WalletCard";
import { Wallet } from "@/src/types/wallet";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

interface WalletSectionProps {
  wallets: Wallet[];
  onAddPress: () => void;
  onWalletPress: (wallet: Wallet) => void;
}

export const WalletSection = ({
  wallets,
  onAddPress,
  onWalletPress,
}: WalletSectionProps) => {
  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <AppText variant="h3" weight="bold">
          Dompet Saya
        </AppText>
        <TouchableOpacity onPress={onAddPress}>
          <AppText weight="bold">+ Tambah</AppText>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} onPress={onWalletPress} />
        ))}
      </ScrollView>
    </View>
  );
};
