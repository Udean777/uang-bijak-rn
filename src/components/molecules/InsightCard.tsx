import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../atoms/AppText";
import { SmartInsight } from "../../types/insight";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Props {
  insight: SmartInsight;
}

export const InsightCard: React.FC<Props> = ({ insight }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const getTypeStyles = () => {
    switch (insight.type) {
      case "danger":
        return { bg: "#FEE2E2", text: "#EF4444", icon: "alert-circle" };
      case "warning":
        return { bg: "#FEF3C7", text: "#F59E0B", icon: "warning" };
      case "success":
        return { bg: "#D1FAE5", text: "#10B981", icon: "checkmark-circle" };
      default:
        return { bg: "#DBEAFE", text: "#3B82F6", icon: "information-circle" };
    }
  };

  const styles = getTypeStyles();

  return (
    <View
      className="p-4 rounded-2xl flex-row items-center gap-4 mb-3 border"
      style={{
        backgroundColor: styles.bg + "20",
        borderColor: styles.bg,
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
        <AppText variant="caption" style={{ color: theme.text }}>
          {insight.message}
        </AppText>
      </View>
    </View>
  );
};
