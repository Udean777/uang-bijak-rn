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
    default: "text-gray-900",
    primary: "text-blue-600",
    secondary: "text-gray-500",
    error: "text-red-500",
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
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
};
