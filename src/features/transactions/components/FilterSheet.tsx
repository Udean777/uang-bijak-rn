import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedType: "all" | "income" | "expense";
  onTypeChange: (type: "all" | "income" | "expense") => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const FilterSheet = ({
  visible,
  onClose,
  selectedType,
  onTypeChange,
  selectedDate,
  onDateChange,
}: FilterSheetProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const changeMonth = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    onDateChange(newDate);
  };

  const FilterOption = ({
    label,
    value,
    active,
  }: {
    label: string;
    value: any;
    active: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => onTypeChange(value)}
      className={`flex-1 py-3 px-2 rounded-xl border items-center ${
        active
          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600"
          : "bg-white border-gray-200"
      }`}
      style={
        !active
          ? { backgroundColor: theme.background, borderColor: theme.border }
          : {}
      }
    >
      <AppText
        weight={active ? "bold" : "regular"}
        color={active ? "primary" : "secondary"}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-3xl p-6 w-full"
              style={{ backgroundColor: theme.background }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <AppText variant="h3" weight="bold">
                  Filter Transaksi
                </AppText>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={theme.icon} />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <AppText variant="label" className="mb-3">
                  Periode
                </AppText>
                <View
                  className="flex-row items-center justify-between p-2 rounded-xl border"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => changeMonth(-1)}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={theme.text}
                    />
                  </TouchableOpacity>

                  <View className="items-center">
                    <AppText weight="bold" className="text-lg">
                      {selectedDate.toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </AppText>
                  </View>

                  <TouchableOpacity
                    onPress={() => changeMonth(1)}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-8">
                <AppText variant="label" className="mb-3">
                  Tipe Transaksi
                </AppText>
                <View className="flex-row gap-3">
                  <FilterOption
                    label="Semua"
                    value="all"
                    active={selectedType === "all"}
                  />
                  <FilterOption
                    label="Masuk"
                    value="income"
                    active={selectedType === "income"}
                  />
                  <FilterOption
                    label="Keluar"
                    value="expense"
                    active={selectedType === "expense"}
                  />
                </View>
              </View>

              <AppButton title="Terapkan Filter" onPress={onClose} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
