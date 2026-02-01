import { useTheme } from "@/src/hooks/useTheme";
import { cn } from "@/src/utils/cn";
import React from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { AppText } from "./AppText";
import {
  BUTTON_CONTAINER_BASE,
  BUTTON_SIZES,
  BUTTON_TEXT_COLORS,
  BUTTON_VARIANTS,
  ButtonSize,
  ButtonVariant,
} from "./config/variants";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  const { colors } = useTheme();

  const isDisabled = disabled || isLoading;
  const variantStyle =
    variant === "outline" ? { borderColor: colors.border } : undefined;

  return (
    <TouchableOpacity
      className={cn(
        BUTTON_CONTAINER_BASE,
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        isDisabled && "opacity-50",
        className,
      )}
      style={[variantStyle, style]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : colors.textInverse}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <AppText
            weight="bold"
            color={BUTTON_TEXT_COLORS[variant]}
            variant="body"
            className="text-center py-2"
          >
            {title}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
};
