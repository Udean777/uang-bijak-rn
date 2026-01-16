import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { ActivityIndicator } from "react-native";

export const AppSpinner = ({
  color,
  size = "small",
}: {
  color?: string;
  size?: "small" | "large";
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return <ActivityIndicator size={size} color={color || theme.primary} />;
};
