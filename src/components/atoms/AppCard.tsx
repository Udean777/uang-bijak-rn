import { cn } from "@/src/utils/cn";
import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";

interface AppCardProps extends ViewProps {
  onPress?: () => void;
  variant?: "elevated" | "outlined" | "flat";
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  className,
  onPress,
  variant = "elevated",
  ...props
}) => {
  const variants = {
    elevated: "bg-white shadow-sm shadow-gray-200 border border-gray-100", // Shadow halus
    outlined: "bg-transparent border border-gray-200",
    flat: "bg-gray-50",
  };

  const commonClasses = cn("rounded-2xl p-4", variants[variant], className);

  if (onPress) {
    return (
      <TouchableOpacity
        className={commonClasses}
        onPress={onPress}
        activeOpacity={0.7}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={commonClasses} {...props}>
      {children}
    </View>
  );
};
