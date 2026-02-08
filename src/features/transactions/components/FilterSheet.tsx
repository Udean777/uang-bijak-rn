import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export type TimeRangeMode = "all" | "custom";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedType: "all" | "income" | "expense";
  onTypeChange: (type: "all" | "income" | "expense") => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  rangeMode: TimeRangeMode;
  onRangeModeChange: (mode: TimeRangeMode) => void;
}

export const FilterSheet = ({
  visible,
  onClose,
  selectedType,
  onTypeChange,
  selectedDate,
  onDateChange,
  rangeMode,
  onRangeModeChange,
}: FilterSheetProps) => {
  const { colors: theme } = useTheme();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleConfirm = (date: Date) => {
    onDateChange(date);
    onRangeModeChange("custom");
    setDatePickerVisibility(false);
  };

  const FilterOption = <T,>({
    label,
    value,
    active,
    onPress,
  }: {
    label: string;
    value: T;
    active: boolean;
    onPress: (val: T) => void;
  }) => (
    <TouchableOpacity
      onPress={() => onPress(value)}
      className={`flex-1 py-3 px-2 rounded-xl border items-center justify-center ${
        active ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
      }`}
      style={
        !active
          ? {
              backgroundColor: theme.background,
              borderColor: theme.border,
            }
          : {}
      }
    >
      <AppText
        variant="caption"
        weight={active ? "bold" : "regular"}
        color={active ? "white" : "secondary"}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  const handleReset = () => {
    onTypeChange("all");
    onRangeModeChange("all");
    onDateChange(new Date());
  };

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
              className="rounded-t-[40px] p-6 w-full"
              style={{ backgroundColor: theme.background }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                  <AppText
                    variant="label"
                    weight="medium"
                    style={{ color: theme.primary }}
                  >
                    Reset
                  </AppText>
                </TouchableOpacity>
                <AppText variant="h3" weight="bold">
                  Filter Transaksi
                </AppText>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <Ionicons name="close" size={24} color={theme.icon} />
                </TouchableOpacity>
              </View>

              {/* Date Filter Section */}
              <View className="mb-6">
                <AppText variant="label" className="mb-3">
                  Berdasarkan Tanggal
                </AppText>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setDatePickerVisibility(true)}
                    activeOpacity={0.7}
                    className="flex-1 flex-row items-center justify-between p-2 rounded-xl border"
                    style={{
                      backgroundColor:
                        rangeMode === "custom" ? "#2563EB" : theme.surface,
                      borderColor:
                        rangeMode === "custom" ? "#2563EB" : theme.border,
                    }}
                  >
                    <AppText
                      variant="caption"
                      weight={rangeMode === "custom" ? "bold" : "regular"}
                      style={{
                        color: rangeMode === "custom" ? "#FFFFFF" : theme.text,
                      }}
                    >
                      {rangeMode === "custom"
                        ? selectedDate.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Pilih Tanggal"}
                    </AppText>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={rangeMode === "custom" ? "#FFFFFF" : theme.icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Transaction Type Section */}
              <View className="mb-8">
                <AppText variant="label" className="mb-3">
                  Tipe Transaksi
                </AppText>
                <View className="flex-row gap-3">
                  <FilterOption
                    label="Semua"
                    value="all"
                    active={selectedType === "all"}
                    onPress={onTypeChange}
                  />
                  <FilterOption
                    label="Masuk"
                    value="income"
                    active={selectedType === "income"}
                    onPress={onTypeChange}
                  />
                  <FilterOption
                    label="Keluar"
                    value="expense"
                    active={selectedType === "expense"}
                    onPress={onTypeChange}
                  />
                </View>
              </View>

              <AppButton title="Terapkan Filter" onPress={onClose} />

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={selectedDate}
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisibility(false)}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
