import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { FilterSheet } from "@/src/features/transactions/components/FilterSheet";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, TextInput, TouchableOpacity, View } from "react-native";

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = TransactionService.subscribeTransactions(user.uid, (data) => {
      const sorted = data.sort((a, b) => b.date - a.date);
      setTransactions(sorted);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filteredData = useMemo(() => {
    return transactions.filter((t) => {
      const query = searchQuery.toLowerCase();
      const amountStr = t.amount.toLocaleString("id-ID");

      const matchSearch =
        t.category.toLowerCase().includes(query) ||
        (t.note && t.note.toLowerCase().includes(query)) ||
        amountStr.includes(query) ||
        t.type.toLowerCase().includes(query);

      const matchType = filterType === "all" || t.type === filterType;

      const tDate = new Date(t.date);
      const matchDate =
        tDate.getMonth() === selectedMonth.getMonth() &&
        tDate.getFullYear() === selectedMonth.getFullYear();

      return matchSearch && matchType && matchDate;
    });
  }, [transactions, searchQuery, filterType, selectedMonth]);

  const handlePress = (item: Transaction) => {
    router.push({
      pathname: "/(modals)/transaction-detail",
      params: { data: JSON.stringify(item) },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b z-10"
        style={{
          backgroundColor: theme.background,
          borderBottomColor: theme.divider,
        }}
      >
        <AppText variant="h2" weight="bold" className="mb-4">
          Riwayat
        </AppText>

        <View className="flex-row gap-3">
          <View
            className="flex-1 flex-row items-center rounded-xl px-3 h-12"
            style={{ backgroundColor: theme.surface }}
          >
            <Ionicons name="search" size={20} color={theme.icon} />
            <TextInput
              className="flex-1 ml-2 font-medium h-full"
              style={{ color: theme.text }}
              placeholder="Cari transaksi..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilter(true)}
            className="w-12 h-12 items-center justify-center rounded-xl border"
            style={{
              backgroundColor:
                filterType !== "all" ||
                selectedMonth.getMonth() !== new Date().getMonth()
                  ? "#2563EB"
                  : theme.surface,
              borderColor:
                filterType !== "all" ||
                selectedMonth.getMonth() !== new Date().getMonth()
                  ? "#2563EB"
                  : theme.border,
            }}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={
                filterType !== "all" ||
                selectedMonth.getMonth() !== new Date().getMonth()
                  ? "white"
                  : theme.text
              }
            />
          </TouchableOpacity>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <AppText variant="caption">
            {selectedMonth.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </AppText>
          <AppText variant="caption">Total: {filteredData.length} Data</AppText>
        </View>
      </View>

      {loading ? (
        <View className="p-5 gap-y-3">
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
          <Skeleton
            variant="box"
            width="100%"
            height={70}
            className="rounded-xl"
          />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View
              className="mb-3 rounded-xl border overflow-hidden"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <TransactionItem transaction={item} onPress={handlePress} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Tidak ditemukan"
              message="Tidak ada transaksi yang cocok dengan filter pencarianmu."
              className="py-20"
            />
          }
        />
      )}

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedType={filterType}
        onTypeChange={setFilterType}
        selectedDate={selectedMonth}
        onDateChange={setSelectedMonth}
      />
    </View>
  );
}
