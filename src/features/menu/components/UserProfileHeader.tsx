import { AppText } from "@/src/components/atoms/AppText";
import React from "react";
import { View } from "react-native";

interface UserProfileHeaderProps {
  displayName: string;
  email: string;
  isDark: boolean;
}

export const UserProfileHeader = ({
  displayName,
  email,
  isDark,
}: UserProfileHeaderProps) => {
  return (
    <View className="flex-row items-center mb-8 pt-4">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mr-4 border"
        style={{
          backgroundColor: isDark ? "rgba(37, 99, 235, 0.2)" : "#DBEAFE",
          borderColor: isDark ? "rgba(37, 99, 235, 0.5)" : "#BFDBFE",
        }}
      >
        <AppText variant="h2" weight="bold">
          {displayName?.charAt(0) || "U"}
        </AppText>
      </View>
      <View>
        <AppText variant="h2" weight="bold">
          {displayName || "User"}
        </AppText>
        <AppText>{email}</AppText>
      </View>
    </View>
  );
};
