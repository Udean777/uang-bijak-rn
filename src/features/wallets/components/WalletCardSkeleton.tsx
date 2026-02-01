import { Skeleton } from "@/src/components/atoms/Skeleton";
import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { View } from "react-native";

export const WalletCardSkeleton = () => {
  const { colors: theme } = useTheme();

  return (
    <View
      className="p-4 mb-3 rounded-2xl border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Skeleton variant="circle" width={40} height={40} />

          <View>
            <Skeleton width={60} height={12} className="mb-1" />
            <Skeleton width={100} height={20} />
          </View>
        </View>

        <Skeleton width={80} height={24} />
      </View>
    </View>
  );
};
