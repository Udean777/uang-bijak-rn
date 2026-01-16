import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  onLongPress?: () => void;
  variant?: "elevated" | "outlined" | "flat";
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  className,
  onPress,
  onLongPress,
  variant = "elevated",
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const variants = {
    elevated: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      elevation: isDark ? 0 : 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 8,
    },
    outlined: {
      backgroundColor: "transparent",
      borderColor: theme.border,
      borderWidth: 1,
    },
    flat: {
      backgroundColor: theme.surface,
    },
  };

  const commonClasses = cn("rounded-2xl p-4", className);
  const variantStyle = variants[variant];

  const isInteractive = onPress || onLongPress;

  if (isInteractive) {
    return (
      <TouchableOpacity
        className={commonClasses}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        style={[variantStyle, style]}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={commonClasses} style={[variantStyle, style]} {...props}>
      {children}
    </View>
  );
};
