import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { SmartInsight } from "../../types/insight";
import { AppText } from "../atoms/AppText";
import { getInsightStyles } from "./config/variants";

interface Props {
  insight: SmartInsight;
}

export const InsightCard: React.FC<Props> = ({ insight }) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () => getInsightStyles(insight.type, isDark, colors),
    [insight.type, isDark, colors],
  );

  return (
    <View
      className="p-4 rounded-2xl flex-row items-center gap-4 mb-3 border"
      style={{
        backgroundColor: styles.bg + (isDark ? "" : "20"), // Add opacity only for light mode if using hex
        borderColor: styles.borderColor,
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: styles.bg }}
      >
        <Ionicons name={insight.icon as any} size={20} color={styles.text} />
      </View>
      <View className="flex-1">
        <AppText weight="bold" style={{ color: styles.text }}>
          {insight.title}
        </AppText>
        <AppText variant="caption" style={{ color: colors.text }}>
          {insight.message}
        </AppText>
      </View>
    </View>
  );
};
