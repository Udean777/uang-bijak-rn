import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, TextInput, TouchableOpacity, View } from "react-native";

// Components
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { FilterSheet } from "@/src/features/transactions/components/FilterSheet"; // Import Sheet
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";

// Hooks & Services
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
      const matchSearch =
        t.category.toLowerCase().includes(query) ||
        (t.note && t.note.toLowerCase().includes(query));

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
    <View className="flex-1 bg-white">
      <View className="px-5 pb-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <AppText variant="h2" weight="bold" className="mb-4">
          Riwayat
        </AppText>

        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 h-12">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 font-medium text-gray-800 h-full"
              placeholder="Cari transaksi..."
              placeholderTextColor="#9CA3AF"
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
            className={`w-12 h-12 items-center justify-center rounded-xl border ${
              filterType !== "all" ||
              selectedMonth.getMonth() !== new Date().getMonth()
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-200"
            }`}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={
                filterType !== "all" ||
                selectedMonth.getMonth() !== new Date().getMonth()
                  ? "white"
                  : "black"
              }
            />
          </TouchableOpacity>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <AppText variant="caption" color="secondary">
            {selectedMonth.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </AppText>
          <AppText variant="caption" color="secondary">
            Total: {filteredData.length} Data
          </AppText>
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
            <View className="mb-3 rounded-xl border border-gray-100 overflow-hidden">
              <TransactionItem transaction={item} onPress={handlePress} />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 opacity-50">
              <Ionicons name="search-outline" size={64} color="gray" />
              <AppText className="mt-4 text-gray-500 text-center">
                Tidak ada transaksi yang ditemukan{"\n"}untuk filter ini.
              </AppText>
            </View>
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
