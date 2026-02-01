import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { useTheme } from "@/src/hooks/useTheme";
import { Transaction } from "@/src/types/transaction";
import React from "react";
import { View } from "react-native";

interface RecentTransactionsSectionProps {
  transactions: Transaction[];
  isLoading: boolean;
  onSeeAllPress: () => void;
  onTransactionPress: (item: Transaction) => void;
}

export const RecentTransactionsSection = ({
  transactions,
  isLoading,
  onSeeAllPress,
  onTransactionPress,
}: RecentTransactionsSectionProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View className="mb-32">
      <View className="flex-row justify-between items-center mb-4">
        <AppText variant="h3" weight="bold">
          Transaksi Terakhir
        </AppText>
        <AppText weight="bold" onPress={onSeeAllPress}>
          Lihat Semua
        </AppText>
      </View>

      {isLoading ? (
        <View className="gap-y-3">
          <Skeleton
            variant="box"
            width="100%"
            height={70}
            className="rounded-xl"
          />
          <Skeleton
            variant="box"
            width="100%"
            height={70}
            className="rounded-xl"
          />
        </View>
      ) : transactions.length === 0 ? (
        <View
          className="py-6 border border-dashed rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <EmptyState
            icon="receipt-outline"
            title="Belum ada transaksi"
            message="Mulai catat pengeluaranmu sekarang."
          />
        </View>
      ) : (
        <View className="gap-y-3">
          {transactions.map((t) => (
            <View
              key={t.id}
              className="rounded-xl overflow-hidden border shadow-sm"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowOpacity: isDark ? 0.3 : 0.1,
              }}
            >
              <TransactionItem transaction={t} onPress={onTransactionPress} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
