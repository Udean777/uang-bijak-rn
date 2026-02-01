import { useTheme } from "@/src/hooks/useTheme";
import { cn } from "@/src/utils/cn";
import React, { useMemo } from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";
import {
  CARD_BASE_CLASSES,
  CardVariant,
  getCardVariantStyles,
} from "./config/variants";

interface AppCardProps extends ViewProps {
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: CardVariant;
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
  const { colors, isDark } = useTheme();

  const variantStyle = useMemo(
    () => getCardVariantStyles(variant, isDark, colors),
    [variant, isDark, colors],
  );

  const commonClasses = cn(CARD_BASE_CLASSES, className);
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
