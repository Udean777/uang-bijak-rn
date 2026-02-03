import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { Goal } from "@/src/types/goal";
import { Wallet } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface GoalItemProps {
  item: Goal;
  wallets: Wallet[];
  onDelete: (id: string) => void;
  onEdit?: (item: Goal) => void;
}

export const GoalItem = ({
  item,
  wallets,
  onDelete,
  onEdit,
}: GoalItemProps) => {
  const { colors: theme, isDark } = useTheme();

  const progress = Math.min(item.currentAmount / item.targetAmount, 1);
  const percentage = Math.round(progress * 100);
  const linkedWallet = wallets.find((w) => w.id === item.walletId);

  return (
    <View
      className="p-5 rounded-3xl mb-4 border"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: item.color + "20" }}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View>
            <AppText weight="bold" variant="h3">
              {item.name}
            </AppText>
            <AppText variant="caption">
              Target: Rp {item.targetAmount.toLocaleString("id-ID")}
            </AppText>
          </View>
        </View>
        <AppText weight="bold" style={{ color: item.color }}>
          {percentage}%
        </AppText>
      </View>

      <View
        className="h-3 w-full rounded-full mb-3"
        style={{ backgroundColor: isDark ? "#333" : "#F3F4F6" }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: item.color,
          }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <AppText variant="caption" weight="medium">
            Terkumpul: Rp {item.currentAmount.toLocaleString("id-ID")}
          </AppText>
          {linkedWallet && (
            <View className="flex-row items-center mt-1">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: linkedWallet.color }}
              />
              <AppText variant="caption" style={{ opacity: 0.6 }}>
                Dompet: {linkedWallet.name}
              </AppText>
            </View>
          )}
        </View>
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
