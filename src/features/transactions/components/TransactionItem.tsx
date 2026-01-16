import { AppBadge } from "@/src/components/atoms/AppBadge";
import { AppText } from "@/src/components/atoms/AppText";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCategoryIcon = (category: string) => {
  const map: any = {
    Makan: "fast-food",
    Transport: "car",
    Belanja: "cart",
    Tagihan: "receipt",
    Gaji: "cash",
    Lainnya: "pricetag",
  };
  return map[category] || "pricetag";
};

interface Props {
  transaction: Transaction;
  onPress?: (t: Transaction) => void;
}

export const TransactionItem: React.FC<Props> = ({ transaction, onPress }) => {
  const isExpense = transaction.type === "expense";
  const colorClass = isExpense ? "text-red-600" : "text-green-600";
  const iconName = getCategoryIcon(transaction.category);

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(transaction)}
      className="flex-row items-center justify-between p-4 bg-white mb-[1px]"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${isExpense ? "bg-red-50" : "bg-green-50"}`}
        >
          <Ionicons
            name={iconName}
            size={20}
            color={isExpense ? "#DC2626" : "#16A34A"}
          />
        </View>

        <View className="flex-1 pr-2">
          <AppText variant="body" weight="medium" numberOfLines={1}>
            {transaction.note || transaction.category}
          </AppText>
          <View className="flex-row items-center mt-1 gap-2">
            <AppText variant="caption" color="secondary">
              {transaction.category}
            </AppText>
            {transaction.classification && (
              <AppBadge
                label={transaction.classification}
                variant={
                  transaction.classification === "need" ? "warning" : "error"
                }
                className="py-0 px-1.5"
              />
            )}
          </View>
        </View>
      </View>

      <AppText variant="body" weight="bold" className={colorClass}>
        {isExpense ? "-" : "+"}
        {formatRupiah(transaction.amount)}
      </AppText>
    </TouchableOpacity>
  );
};
