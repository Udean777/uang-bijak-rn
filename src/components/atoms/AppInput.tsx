import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/src/utils/cn";
import React from "react";
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

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
          className
        )}
        style={[
          {
            backgroundColor: error ? undefined : theme.surface,
            borderColor: error ? undefined : theme.border,
            color: theme.text,
          },
          style,
        ]}
        placeholderTextColor={theme.icon}
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
