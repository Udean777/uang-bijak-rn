import { AppText } from "@/src/components/atoms/AppText";
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
      className="flex-row items-center justify-between p-4 bg-white active:bg-gray-50"
    >
      <View className="flex-row items-center gap-4 flex-1">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${isExpense ? "bg-red-50" : "bg-green-50"}`}
        >
          <Ionicons
            name={getIconName(transaction.category)}
            size={20}
            color={isExpense ? "#DC2626" : "#16A34A"}
          />
        </View>

        <View className="flex-1">
          <AppText
            weight="bold"
            className="text-gray-900 mb-0.5"
            numberOfLines={1}
          >
            {transaction.category}
          </AppText>
          <View className="flex-row items-center gap-2">
            <AppText variant="caption" color="secondary">
              {formatDate(transaction.date)}
            </AppText>
            {transaction.note && (
              <AppText
                variant="caption"
                color="secondary"
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
          className={isExpense ? "text-red-600" : "text-green-600"}
        >
          {isExpense ? "-" : "+"}
          {formatRupiah(transaction.amount)}
        </AppText>
        {transaction.classification && (
          <AppText
            variant="caption"
            className="text-xs text-gray-400 mt-1 uppercase"
          >
            {transaction.classification}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
};
