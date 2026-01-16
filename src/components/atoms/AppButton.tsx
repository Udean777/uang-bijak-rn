import { cn } from "@/src/utils/cn";
import React from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { AppText } from "./AppText";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  leftIcon,
  ...props
}) => {
  const containerBase = "flex-row items-center justify-center rounded-xl";

  const containerVariants = {
    primary: "bg-blue-600 border border-blue-600",
    secondary: "bg-blue-100 border border-blue-100",
    outline: "bg-transparent border border-gray-300",
    ghost: "bg-transparent border-transparent",
    danger: "bg-red-600 border border-red-600",
  };

  const sizes = {
    sm: "py-2 px-3",
    md: "py-3 px-4",
    lg: "py-4 px-6",
  };

  const textColors = {
    primary: "white",
    secondary: "primary",
    outline: "default",
    ghost: "primary",
    danger: "white",
  } as const;

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={cn(
        containerBase,
        containerVariants[variant],
        sizes[size],
        isDisabled && "opacity-50",
        className
      )}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "outline" ? "#2563EB" : "#fff"} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <AppText
            weight="bold"
            color={textColors[variant]}
            className="text-center"
          >
            {title}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
};
