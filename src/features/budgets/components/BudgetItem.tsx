import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface BudgetItemProps {
  item: any;
  onDelete: (id: string) => void;
  onEdit?: (item: any) => void;
}

export const BudgetItem = ({ item, onDelete, onEdit }: BudgetItemProps) => {
  const { colors: theme, isDark } = useTheme();

  const percentage = Math.round(item.percentage * 100);
  const isOverBudget = item.currentSpending > item.limitAmount;

  return (
    <View
      className="p-5 rounded-3xl mb-4 border"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <AppText weight="bold" variant="h3">
            {item.categoryName}
          </AppText>
          <AppText variant="caption">
            Limit: Rp {item.limitAmount.toLocaleString("id-ID")}
          </AppText>
        </View>
        <View className="items-end">
          <AppText weight="bold" color={isOverBudget ? "error" : "default"}>
            {percentage}%
          </AppText>
          <AppText variant="caption">Terpakai</AppText>
        </View>
      </View>

      <View
        className="h-3 w-full rounded-full mb-3"
        style={{ backgroundColor: isDark ? "#333" : "#F3F4F6" }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: isOverBudget ? theme.danger : theme.primary,
          }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <AppText variant="caption">
          Sisa: Rp {Math.max(0, item.remaining).toLocaleString("id-ID")}
        </AppText>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => onEdit?.(item)} className="p-1">
            <Ionicons name="create-outline" size={18} color={theme.info} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)} className="p-1">
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
