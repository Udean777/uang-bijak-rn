import React from "react";
import { ActivityIndicator } from "react-native";

export const AppSpinner = ({
  color = "#2563EB",
  size = "small",
}: {
  color?: string;
  size?: "small" | "large";
}) => <ActivityIndicator size={size} color={color} />;
