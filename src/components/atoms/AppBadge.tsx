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
  const styles = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <View
      className={cn(
        "px-2 py-1 rounded-md self-start",
        styles[variant].split(" ")[0],
        className
      )}
    >
      <AppText
        variant="caption"
        weight="bold"
        className={styles[variant].split(" ")[1]}
      >
        {label}
      </AppText>
    </View>
  );
};
