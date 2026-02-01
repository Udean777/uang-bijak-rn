import { AppText } from "@/src/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface HomeHeaderProps {
  displayName: string;
  isDark: boolean;
  toggleColorScheme: () => void;
  onMenuPress: () => void;
  theme: any;
}

export const HomeHeader = ({
  displayName,
  isDark,
  toggleColorScheme,
  onMenuPress,
  theme,
}: HomeHeaderProps) => {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <View>
        <AppText color="default">Selamat Pagi,</AppText>
        <AppText variant="h2" weight="bold">
          {displayName || "Pengguna"}
        </AppText>
      </View>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={toggleColorScheme}
          className="w-10 h-10 rounded-full items-center justify-center border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={20}
            color={theme.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMenuPress}
          className="w-10 h-10 rounded-full items-center justify-center border shadow-sm"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowOpacity: isDark ? 0.3 : 0.1,
          }}
        >
          <AppText weight="bold">{displayName?.charAt(0) || "U"}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
