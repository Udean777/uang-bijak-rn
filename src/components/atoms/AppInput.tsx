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
  ...props
}) => {
  return (
    <View className={cn("w-full mb-4", containerClass)}>
      {label && (
        <AppText variant="label" weight="medium" className="mb-2 text-gray-700">
          {label}
        </AppText>
      )}

      <TextInput
        className={cn(
          "w-full bg-gray-50 border rounded-xl p-4 text-gray-900 text-base",
          error
            ? "border-red-500 bg-red-50"
            : "border-gray-200 focus:border-blue-500",
          className
        )}
        placeholderTextColor="#9CA3AF"
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
