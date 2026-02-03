import { formatCurrency } from "@/src/hooks/useCurrencyFormat";
import { useTheme } from "@/src/hooks/useTheme";
import { cn } from "@/src/utils/cn";
import React, { useCallback, useMemo } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { AppText } from "./AppText";

interface CurrencyInputProps extends Omit<
  TextInputProps,
  "onChangeText" | "value"
> {
  label?: string;
  error?: string;
  containerClass?: string;
  value: string;
  onChangeText: (formatted: string) => void;
  showPrefix?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  error,
  containerClass,
  className,
  style,
  value,
  onChangeText,
  showPrefix = true,
  placeholder = "0",
  ...props
}) => {
  const { colors } = useTheme();

  const handleChange = useCallback(
    (text: string) => {
      const formatted = formatCurrency(text);
      onChangeText(formatted);
    },
    [onChangeText],
  );

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

      <View
        className={cn(
          "w-full border rounded-xl flex-row items-center",
          error
            ? "border-danger bg-red-50 dark:bg-red-900/10"
            : "focus:border-primary",
        )}
        style={inputStyles}
      >
        {showPrefix && (
          <AppText
            weight="medium"
            className="pl-4 pr-2"
            style={{ color: colors.textSecondary }}
          >
            Rp
          </AppText>
        )}
        <TextInput
          className={cn(
            "flex-1 py-4 text-base",
            showPrefix ? "pr-4" : "px-4",
            className,
          )}
          style={[
            {
              color: colors.text,
              minHeight: 52,
              lineHeight: 20,
            },
            style,
          ]}
          placeholderTextColor={colors.icon}
          keyboardType="numeric"
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          {...props}
        />
      </View>

      {error && (
        <AppText variant="caption" color="error" className="mt-1">
          {error}
        </AppText>
      )}
    </View>
  );
};
