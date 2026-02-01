import { useTheme } from "@/src/hooks/useTheme";
import { cn } from "@/src/utils/cn";
import React, { useMemo } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { AppText } from "./AppText";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClass?: string;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  containerClass,
  className,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const inputStyles = useMemo(
    () => ({
      backgroundColor: error ? undefined : colors.surface,
      borderColor: error ? undefined : colors.border,
      color: colors.text,
    }),
    [error, colors],
  );

  return (
    <View className={cn("w-full mb-4", containerClass)}>
      {label && (
        <AppText variant="label" weight="medium" className="pb-2">
          {label}
        </AppText>
      )}

      <TextInput
        className={cn(
          "w-full border rounded-xl p-4 text-base",
          error
            ? "border-danger bg-red-50 dark:bg-red-900/10"
            : "focus:border-primary",
          className,
        )}
        style={[inputStyles, style]}
        placeholderTextColor={colors.icon}
        {...props}
      />

      {error && (
        <AppText variant="caption" color="error" className="mt-1">
          {error}
        </AppText>
      )}
    </View>
  );
};
