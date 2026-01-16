import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TransactionHistorySheetProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  loading: boolean;
  onTransactionPress: (transaction: Transaction) => void;
}

export const TransactionHistorySheet = ({
  visible,
  onClose,
  transactions,
  loading,
  onTransactionPress,
}: TransactionHistorySheetProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );

  const filteredData = useMemo(() => {
    return transactions.filter((t) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        t.category.toLowerCase().includes(query) ||
        (t.note && t.note.toLowerCase().includes(query));

      const matchType = filterType === "all" || t.type === filterType;

      return matchSearch && matchType;
    });
  }, [transactions, searchQuery, filterType]);

  const FilterOption = ({
    label,
    value,
    active,
  }: {
    label: string;
    value: "all" | "income" | "expense";
    active: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => setFilterType(value)}
      className={`flex-1 py-2 px-1 rounded-xl border items-center ${
        active
          ? "bg-blue-50 dark:bg-blue-900/30 border-primary"
          : "bg-white border-gray-200"
      }`}
      style={
        !active
          ? { backgroundColor: theme.background, borderColor: theme.border }
          : {}
      }
    >
      <AppText
        variant="caption"
        weight={active ? "bold" : "regular"}
        color={active ? "primary" : "secondary"}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-[32px] w-full h-[85%]"
              style={{ backgroundColor: theme.surface }}
            >
              <View
                className="rounded-t-[32px] px-6 pt-4 pb-4 border-b"
                style={{
                  backgroundColor: theme.background,
                  borderBottomColor: theme.divider,
                }}
              >
                <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-4" />
                <View className="flex-row justify-between items-center mb-4">
                  <AppText variant="h3" weight="bold">
                    Semua Transaksi
                  </AppText>
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: theme.surface }}
                  >
                    <Ionicons name="close" size={20} color={theme.icon} />
                  </TouchableOpacity>
                </View>

                <View
                  className="flex-row items-center rounded-2xl px-3 h-12 mb-4"
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
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={theme.icon}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-row gap-3">
                  <FilterOption
                    label="Semua"
                    value="all"
                    active={filterType === "all"}
                  />
                  <FilterOption
                    label="Masuk"
                    value="income"
                    active={filterType === "income"}
                  />
                  <FilterOption
                    label="Keluar"
                    value="expense"
                    active={filterType === "expense"}
                  />
                </View>
              </View>

              <View className="flex-1 px-5">
                {loading ? (
                  <View className="py-5 gap-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton
                        key={i}
                        variant="box"
                        width="100%"
                        height={70}
                        className="rounded-xl"
                      />
                    ))}
                  </View>
                ) : (
                  <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                      paddingVertical: 20,
                      paddingBottom: 60,
                    }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <View className="mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <TransactionItem
                          transaction={item}
                          onPress={onTransactionPress}
                        />
                      </View>
                    )}
                    ListEmptyComponent={
                      <EmptyState
                        icon="receipt-outline"
                        title="Belum ada data"
                        message="Belum ada transaksi yang tercatat."
                        className="py-20"
                      />
                    }
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
