import { AppText } from "@/src/components/atoms/AppText";
import { InsightCard } from "@/src/components/molecules/InsightCard";
import { SmartInsight } from "@/src/types/insight";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface InsightSectionProps {
  insights: SmartInsight[];
}

export const InsightSection = ({ insights }: InsightSectionProps) => {
  if (insights.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="bulb" size={18} color="#3B82F6" />
        <AppText variant="h3" weight="bold">
          Insights Finansial
        </AppText>
      </View>
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </View>
  );
};
