import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const containerBase = "flex-row items-center justify-center rounded-xl";

  const containerVariants = {
    primary: "bg-primary border border-primary",
    secondary:
      "bg-blue-100 dark:bg-blue-900 border border-blue-100 dark:border-blue-900",
    outline: "bg-transparent border",
    ghost: "bg-transparent border-transparent",
    danger: "bg-danger border border-danger",
  };

  const variantStyles = {
    outline: { borderColor: theme.border },
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
    ghost: "white",
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
      style={[variantStyles[variant as keyof typeof variantStyles], style]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" ? theme.primary : theme.textInverse}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <AppText
            weight="bold"
            color={textColors[variant]}
            variant="label"
            className="text-center py-2"
          >
            {title}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
};
