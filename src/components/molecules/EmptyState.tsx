import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { AppButton } from "../atoms/AppButton";
import { AppText } from "../atoms/AppText";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  title,
  message,
  icon = "file-tray-outline",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View className={`items-center justify-center py-10 px-6 ${className}`}>
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: theme.surface }}
      >
        <Ionicons name={icon} size={48} color={theme.icon} />
      </View>

      <AppText variant="h3" weight="bold" className="text-center mb-2">
        {title}
      </AppText>

      <AppText className="text-center mb-8 leading-6 max-w-xs">
        {message}
      </AppText>

      {actionLabel && onAction && (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          className="w-full max-w-[200px]"
        />
      )}
    </View>
  );
};
