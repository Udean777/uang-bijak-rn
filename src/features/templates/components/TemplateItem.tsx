import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { TransactionTemplate } from "@/src/types/template";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface TemplateItemProps {
  item: TransactionTemplate;
  onDelete: (id: string) => void;
}

export const TemplateItem = ({ item, onDelete }: TemplateItemProps) => {
  const { colors: theme, isDark } = useTheme();

  return (
    <View
      className="flex-row items-center justify-between p-4 rounded-2xl mb-3 border"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDark ? "rgba(234, 88, 12, 0.15)" : "#FFEDD5",
          }}
        >
          <Ionicons name="flash" size={20} color="#EA580C" />
        </View>
        <View>
          <AppText weight="bold">{item.name}</AppText>
          <AppText variant="caption">
            {item.category} • Rp {item.amount.toLocaleString()}
          </AppText>
        </View>
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color={theme.danger} />
      </TouchableOpacity>
    </View>
  );
};
