import { useTheme } from "@/src/hooks/useTheme";
import { cn } from "@/src/utils/cn";
import React from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import {
  BADGE_VARIANTS,
  BadgeVariant,
  getBadgeTextColor,
} from "./config/variants";

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
  const { colors, isDark } = useTheme();

  const variantConfig = BADGE_VARIANTS[variant][isDark ? "dark" : "light"];
  const textColor = getBadgeTextColor(variant, isDark, colors);

  return (
    <View
      className={cn(
        "px-2 py-1 rounded-md self-start",
        variantConfig.bg,
        className,
      )}
    >
      <AppText variant="caption" weight="bold" style={{ color: textColor }}>
        {label}
      </AppText>
    </View>
  );
};
