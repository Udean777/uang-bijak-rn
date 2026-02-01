import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { TransactionType } from "../hooks/useTransactionForm";

interface TransactionTypePickerProps {
  type: TransactionType;
  setType: (type: TransactionType) => void;
}

export const TransactionTypePicker = ({
  type,
  setType,
}: TransactionTypePickerProps) => {
  const { colors, isDark } = useTheme();

  const options: {
    label: string;
    value: TransactionType;
    activeColor: string;
    activeBg: string;
  }[] = [
    {
      label: "Pengeluaran",
      value: "expense",
      activeColor: colors.danger,
      activeBg: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2",
    },
    {
      label: "Pemasukan",
      value: "income",
      activeColor: colors.success,
      activeBg: isDark ? "rgba(16, 185, 129, 0.15)" : "#F0FDF4",
    },
    {
      label: "Transfer",
      value: "transfer",
      activeColor: "#3B82F6",
      activeBg: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
    },
  ];

  return (
    <View
      className="flex-row p-1 rounded-xl mb-6 shadow-sm"
      style={{ backgroundColor: colors.surface }}
    >
      {options.map((opt) => {
        const isActive = type === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setType(opt.value)}
            className="flex-1 py-3 rounded-lg items-center"
            style={isActive ? { backgroundColor: opt.activeBg } : {}}
          >
            <AppText
              weight="bold"
              style={{
                color: isActive
                  ? opt.activeColor
                  : isDark
                    ? colors.text
                    : "gray",
                opacity: isActive ? 1 : 0.5,
              }}
            >
              {opt.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
