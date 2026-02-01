import { AppText } from "@/src/components/atoms/AppText";
import { TransactionTemplate } from "@/src/types/template";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

interface QuickAccessSectionProps {
  templates: TransactionTemplate[];
  onUseTemplate: (tpl: TransactionTemplate) => void;
  onManagePress: () => void;
  theme: any;
  isDark: boolean;
}

export const QuickAccessSection = ({
  templates,
  onUseTemplate,
  onManagePress,
  theme,
  isDark,
}: QuickAccessSectionProps) => {
  if (templates.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="flash" size={18} color="#F59E0B" />
          <AppText variant="h3" weight="bold">
            Akses Cepat
          </AppText>
        </View>
        <TouchableOpacity onPress={onManagePress}>
          <AppText variant="label" color="primary">
            Kelola
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {templates.map((tpl) => (
          <TouchableOpacity
            key={tpl.id}
            onPress={() => onUseTemplate(tpl)}
            className="mr-3 p-3 rounded-2xl border flex-row items-center gap-3 pr-5 shadow-sm"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowOpacity: isDark ? 0.2 : 0.05,
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark ? "rgba(234, 88, 12, 0.15)" : "#FFEDD5",
              }}
            >
              <Ionicons name="flash-outline" size={20} color="#EA580C" />
            </View>
            <View>
              <AppText weight="bold">{tpl.name}</AppText>
              <AppText variant="caption">
                Rp {tpl.amount.toLocaleString()}
              </AppText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
