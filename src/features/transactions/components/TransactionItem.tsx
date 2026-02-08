import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

export const TransactionItem = ({
  transaction,
  onPress,
}: TransactionItemProps) => {
  const { colors: theme, isDark } = useTheme();

  const isExpense = transaction.type === "expense";

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const formatDate = (date: Date | string | number) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const getIconName = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("makan")) return "fast-food";
    if (lower.includes("transport")) return "car";
    if (lower.includes("belanja")) return "cart";
    if (lower.includes("gaji")) return "cash";
    if (lower.includes("tagihan")) return "receipt";
    return "pricetag";
  };

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(transaction)}
      className="flex-row items-center justify-between p-4"
      style={{
        backgroundColor: theme.background,
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-4 flex-1">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: isExpense
              ? isDark
                ? "rgba(239, 68, 68, 0.1)"
                : "#FEF2F2"
              : isDark
                ? "rgba(34, 197, 94, 0.1)"
                : "#F0FDF4",
          }}
        >
          <Ionicons
            name={getIconName(transaction.category || "")}
            size={20}
            color={isExpense ? theme.danger : theme.success}
          />
        </View>

        <View className="flex-1">
          <AppText weight="bold" numberOfLines={1}>
            {transaction.type === "transfer"
              ? "Transfer"
              : transaction.category || "Tanpa Kategori"}
          </AppText>
          <View className="flex-row items-center gap-2">
            <AppText variant="caption">{formatDate(transaction.date)}</AppText>
            {transaction.note && (
              <AppText
                variant="caption"
                numberOfLines={1}
                className="flex-1 italic"
              >
                — {transaction.note}
              </AppText>
            )}
          </View>
        </View>
      </View>

      <View className="items-end">
        <AppText
          weight="bold"
          style={{ color: isExpense ? theme.danger : theme.success }}
        >
          {isExpense ? "-" : "+"}
          {formatRupiah(transaction.amount)}
        </AppText>
        {transaction.classification && (
          <AppText
            variant="caption"
            className="text-xs mt-1 uppercase"
            color="secondary"
          >
            {transaction.classification}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
};
