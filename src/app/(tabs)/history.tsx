import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { useTransactions } from "@/src/features/transactions/hooks/useTransactions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SectionList, View } from "react-native";

export default function HistoryScreen() {
  const router = useRouter();
  const { sections, isLoading } = useTransactions();

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 p-5 ">
        <AppText variant="h2" weight="bold" className="mb-6">
          Riwayat Transaksi
        </AppText>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="flex-row items-center mb-4 gap-4">
            <Skeleton variant="circle" width={40} height={40} />
            <View>
              <Skeleton
                variant="text"
                width={120}
                height={16}
                className="mb-2"
              />
              <Skeleton variant="text" width={80} height={12} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 mb-4">
        <AppText variant="h2" weight="bold">
          Riwayat Transaksi
        </AppText>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-gray-50 px-5 py-3 mt-2">
            <AppText
              variant="caption"
              weight="bold"
              color="secondary"
              className="uppercase tracking-wider"
            >
              {title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="px-5">
            <View className="rounded-xl overflow-hidden shadow-sm">
              <TransactionItem
                transaction={item}
                onPress={(t) =>
                  router.push({
                    pathname: "/(modals)/transaction-detail",
                    params: { data: JSON.stringify(t) },
                  })
                }
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 px-10">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
            </View>
            <AppText variant="h3" weight="bold" className="text-gray-400 mb-2">
              Belum ada transaksi
            </AppText>
            <AppText variant="body" className="text-gray-400 text-center">
              Mulai catat pengeluaran dan pemasukan Anda hari ini.
            </AppText>
          </View>
        }
      />
    </View>
  );
}
