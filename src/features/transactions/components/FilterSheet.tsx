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
        active ? "bg-blue-50 border-blue-600" : "bg-white border-gray-200"
      }`}
    >
      <AppText
        weight={active ? "bold" : "regular"}
        className={active ? "text-blue-600" : "text-gray-600"}
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
            <View className="bg-white rounded-t-3xl p-6 w-full">
              <View className="flex-row justify-between items-center mb-6">
                <AppText variant="h3" weight="bold">
                  Filter Transaksi
                </AppText>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="gray" />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <AppText variant="label" className="mb-3 text-gray-500">
                  Periode
                </AppText>
                <View className="flex-row items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <TouchableOpacity
                    onPress={() => changeMonth(-1)}
                    className="p-2 bg-white rounded-lg shadow-sm"
                  >
                    <Ionicons name="chevron-back" size={20} color="black" />
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
                    className="p-2 bg-white rounded-lg shadow-sm"
                  >
                    <Ionicons name="chevron-forward" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-8">
                <AppText variant="label" className="mb-3 text-gray-500">
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
