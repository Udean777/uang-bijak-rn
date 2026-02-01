import { AppText } from "@/src/components/atoms/AppText";
import { formatRupiah } from "@/src/features/analysis/hooks/useAnalysisScreen";
import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { View } from "react-native";

interface LegendItemProps {
  label: string;
  color: string;
  value: number;
  totalExpense: number;
}

export const LegendItem = ({
  label,
  color,
  value,
  totalExpense,
}: LegendItemProps) => {
  const { colors: theme } = useTheme();

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
          }}
        />
        <AppText style={{ color: theme.text }}>{label}</AppText>
      </View>
      <View className="items-end">
        <AppText weight="bold">{formatRupiah(value)}</AppText>
        <AppText variant="caption" color="secondary">
          {((value / totalExpense) * 100).toFixed(1)}%
        </AppText>
      </View>
    </View>
  );
};
