import { AppText } from "@/src/components/atoms/AppText";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Classification } from "../hooks/useTransactionForm";

interface ClassificationPickerProps {
  classification: Classification;
  setClassification: (val: Classification) => void;
  theme: any;
  isDark: boolean;
}

export const ClassificationPicker = ({
  classification,
  setClassification,
  theme,
  isDark,
}: ClassificationPickerProps) => {
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
                : theme.surface,
            borderColor: classification === "need" ? "#3B82F6" : theme.border,
          }}
        >
          <AppText
            weight="bold"
            className="text-lg mb-1"
            style={{
              color: classification === "need" ? "#3B82F6" : theme.text,
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
                : theme.surface,
            borderColor: classification === "want" ? "#A855F7" : theme.border,
          }}
        >
          <AppText
            weight="bold"
            className="text-lg mb-1"
            style={{
              color: classification === "want" ? "#A855F7" : theme.text,
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
