import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import {
  RecurringFrequency,
  RecurringTransaction,
} from "@/src/types/recurring";
import { Wallet } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, TouchableOpacity, View } from "react-native";

const FREQUENCIES: { label: string; value: RecurringFrequency }[] = [
  { label: "Harian", value: "daily" },
  { label: "Mingguan", value: "weekly" },
  { label: "Bulanan", value: "monthly" },
  { label: "Tahunan", value: "yearly" },
];

interface RecurringItemProps {
  item: RecurringTransaction;
  wallets: Wallet[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (item: RecurringTransaction) => void;
}

export const RecurringItem = ({
  item,
  wallets,
  onToggle,
  onDelete,
  onEdit,
}: RecurringItemProps) => {
  const { colors: theme } = useTheme();

  const wallet = wallets.find((w) => w.id === item.walletId);
  const freqLabel = FREQUENCIES.find((f) => f.value === item.frequency)?.label;

  return (
    <View
      className="p-5 rounded-3xl mb-4 border"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons
              name={
                item.type === "income" ? "arrow-down-circle" : "arrow-up-circle"
              }
              size={20}
              color={item.type === "income" ? "#10B981" : "#EF4444"}
            />
            <AppText weight="bold" variant="h3">
              {item.category}
            </AppText>
          </View>
          <AppText variant="caption">
            {freqLabel} • Rp {item.amount.toLocaleString("id-ID")}
          </AppText>
          <AppText variant="caption" color="secondary">
            Ke: {wallet?.name || "Dompet Terhapus"}
          </AppText>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={(val) => onToggle(item.id, val)}
        />
      </View>

      <View
        className="flex-row justify-between items-center pt-2 border-t border-gray-100"
        style={{ borderTopColor: theme.divider }}
      >
        <AppText variant="caption" color="secondary">
          Next: {new Date(item.nextExecutionDate).toLocaleDateString("id-ID")}
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
