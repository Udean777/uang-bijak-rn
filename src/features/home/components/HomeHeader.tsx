import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface HomeHeaderProps {
  displayName: string;
  toggleColorScheme: () => void;
  onMenuPress: () => void;
}

export const HomeHeader = ({
  displayName,
  toggleColorScheme,
  onMenuPress,
}: HomeHeaderProps) => {
  const { colors, isDark } = useTheme();

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
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={20}
            color={colors.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMenuPress}
          className="w-10 h-10 rounded-full items-center justify-center border shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowOpacity: isDark ? 0.3 : 0.1,
          }}
        >
          <AppText weight="bold">{displayName?.charAt(0) || "U"}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
