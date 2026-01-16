import { Skeleton } from "@/src/components/atoms/Skeleton";
import React from "react";
import { View } from "react-native";

export const WalletCardSkeleton = () => {
  return (
    <View className="p-4 mb-3 rounded-2xl border border-gray-100 bg-white">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Skeleton variant="circle" width={40} height={40} />

          <View>
            <Skeleton variant="text" width={60} height={12} className="mb-1" />
            <Skeleton variant="text" width={100} height={20} />
          </View>
        </View>

        <Skeleton variant="text" width={80} height={24} />
      </View>
    </View>
  );
};
