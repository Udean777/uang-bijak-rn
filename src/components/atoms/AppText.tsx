import { useTheme } from "@/src/hooks/useTheme";
import { cn } from "@/src/utils/cn";
import React from "react";
import { Text, TextProps } from "react-native";
import {
  getTextColor,
  TEXT_VARIANTS,
  TEXT_WEIGHTS,
  TextColor,
  TextVariant,
  TextWeight,
} from "./config/variants";

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  className?: string;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = "body",
  weight = "regular",
  color = "default",
  className,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <Text
      className={cn(
        "font-jakarta",
        TEXT_VARIANTS[variant],
        TEXT_WEIGHTS[weight],
        className,
      )}
      style={[{ color: getTextColor(color, colors) }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
