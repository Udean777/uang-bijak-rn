import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/src/utils/cn";
import React from "react";
import { Text, TextProps } from "react-native";

interface AppTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
  weight?: "regular" | "medium" | "bold" | "semibold";
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "default"
    | "white"
    | "success"
    | "danger";
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const baseStyle = "font-jakarta";

  const variants = {
    h1: "text-3xl leading-tight",
    h2: "text-2xl leading-snug",
    h3: "text-xl leading-snug",
    body: "text-base leading-relaxed",
    caption: "text-xs leading-normal",
    label: "text-sm leading-none",
  };

  const weights = {
    regular: "font-jakarta",
    medium: "font-jakartaMedium",
    semibold: "font-jakartaSemiBold",
    bold: "font-jakartaBold",
  };

  const colors: Record<string, string> = {
    default: "",
    primary: "text-primary",
    secondary: "text-secondary",
    error: "text-danger",
    white: "text-white",
    success: "text-success",
    danger: "text-danger",
  };

  const getStyleColor = () => {
    switch (color) {
      case "default":
        return theme.text;
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.secondary;
      case "error":
        return theme.danger;
      case "success":
        return theme.success;
      case "danger":
        return theme.danger;
      case "white":
        return "#FFFFFF";
      default:
        return color;
    }
  };

  return (
    <Text
      className={cn(
        baseStyle,
        variants[variant],
        weights[weight],
        colors[color],
        className,
      )}
      style={[{ color: getStyleColor() }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
