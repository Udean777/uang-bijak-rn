import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Classification } from "../hooks/useTransactionForm";

interface ClassificationPickerProps {
  classification: Classification;
  setClassification: (val: Classification) => void;
}

export const ClassificationPicker = ({
  classification,
  setClassification,
}: ClassificationPickerProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View className="mb-6">
      <AppText variant="caption" weight="bold" className="uppercase mb-3">
        Jenis Pengeluaran (Analisa)
      </AppText>
      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={() => setClassification("need")}
          className="flex-1 p-4 rounded-xl border-2"
          style={{
            backgroundColor:
              classification === "need"
                ? isDark
                  ? "rgba(37, 99, 235, 0.1)"
                  : "#EFF6FF"
                : colors.surface,
            borderColor: classification === "need" ? "#3B82F6" : colors.border,
          }}
        >
          <AppText
            weight="bold"
            className="text-lg mb-1"
            style={{
              color: classification === "need" ? "#3B82F6" : colors.text,
            }}
          >
            Needs 🍞
          </AppText>
          <AppText variant="caption">Wajib, Primer, Tagihan.</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setClassification("want")}
          className="flex-1 p-4 rounded-xl border-2"
          style={{
            backgroundColor:
              classification === "want"
                ? isDark
                  ? "rgba(147, 51, 234, 0.1)"
                  : "#FAF5FF"
                : colors.surface,
            borderColor: classification === "want" ? "#A855F7" : colors.border,
          }}
        >
          <AppText
            weight="bold"
            className="text-lg mb-1"
            style={{
              color: classification === "want" ? "#A855F7" : colors.text,
            }}
          >
            Wants 🎮
          </AppText>
          <AppText variant="caption">Hiburan, Jajan, Hobi.</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
