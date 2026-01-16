import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/src/utils/cn";
import React from "react";
import { Text, TextProps } from "react-native";

interface AppTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
  weight?: "regular" | "medium" | "bold" | "semibold";
  color?: "primary" | "secondary" | "error" | "default" | "white";
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

  const colors = {
    default: "text-white",
    primary: "text-primary",
    secondary: "text-secondary",
    error: "text-danger",
    white: "text-white",
  };

  return (
    <Text
      className={cn(
        baseStyle,
        variants[variant],
        weights[weight],
        colors[color],
        className
      )}
      style={[{ color: color === "default" ? theme.text : color }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
