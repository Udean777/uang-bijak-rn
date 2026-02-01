import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { ActivityIndicator } from "react-native";

interface AppSpinnerProps {
  color?: string;
  size?: "small" | "large";
}

export const AppSpinner: React.FC<AppSpinnerProps> = ({
  color,
  size = "small",
}) => {
  const { colors } = useTheme();

  return <ActivityIndicator size={size} color={color ?? colors.primary} />;
};
