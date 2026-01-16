import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/src/utils/cn";
import React from "react";
import { View } from "react-native";
import { AppText } from "./AppText";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = "default",
  className,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const variants = {
    success: {
      bg: isDark ? "bg-green-900/30" : "bg-green-100",
      text: isDark ? theme.success : "#15803d", // text-green-700
    },
    warning: {
      bg: isDark ? "bg-yellow-900/30" : "bg-yellow-100",
      text: isDark ? theme.warning : "#a16207", // text-yellow-700
    },
    error: {
      bg: isDark ? "bg-red-900/30" : "bg-red-100",
      text: isDark ? theme.danger : "#b91c1c", // text-red-700
    },
    info: {
      bg: isDark ? "bg-blue-900/30" : "bg-blue-100",
      text: isDark ? theme.primary : "#1d4ed8", // text-blue-700
    },
    default: {
      bg: isDark ? "bg-gray-800" : "bg-gray-100",
      text: theme.secondary,
    },
  };

  const currentVariant = variants[variant];

  return (
    <View
      className={cn(
        "px-2 py-1 rounded-md self-start",
        currentVariant.bg,
        className
      )}
    >
      <AppText
        variant="caption"
        weight="bold"
        style={{ color: currentVariant.text }}
      >
        {label}
      </AppText>
    </View>
  );
};
