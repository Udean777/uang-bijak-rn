import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAddDebt } from "@/src/features/debts/hooks/useAddDebt";
import { useTheme } from "@/src/hooks/useTheme";
import { DebtType } from "@/src/types/debt";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface AddDebtSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AddDebtSheet = ({ visible, onClose }: AddDebtSheetProps) => {
  const { colors, isDark } = useTheme();

  const {
    personName,
    setPersonName,
    amount,
    setAmount,
    type,
    setType,
    dueDate,
    isDatePickerVisible,
    setDatePickerVisibility,
    isLoading,
    handleConfirmDate,
    handleSave,
  } = useAddDebt(onClose);

  const TypeOption = ({ val, label }: { val: DebtType; label: string }) => {
    const isSelected = type === val;
    const isReceivable = val === "receivable";

    let bgColor = colors.surface;
    let borderColor = colors.border;
    let textColor: string = colors.text;

    if (isSelected) {
      if (isReceivable) {
        bgColor = isDark ? "rgba(22, 163, 74, 0.2)" : "#F0FDF4";
        borderColor = "#16A34A";
        textColor = "#16A34A";
      } else {
        bgColor = isDark ? "rgba(220, 38, 38, 0.2)" : "#FEF2F2";
        borderColor = "#DC2626";
        textColor = "#DC2626";
      }
    }

    return (
      <TouchableOpacity
        onPress={() => setType(val)}
        className="flex-1 p-3 rounded-xl border items-center"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
        }}
      >
        <AppText
          weight="bold"
          style={isSelected ? { color: textColor } : {}}
          color={isSelected ? undefined : isDark ? "white" : "default"}
        >
          {label}
        </AppText>
      </TouchableOpacity>
    );
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              className="rounded-t-3xl h-[80%] w-full p-6"
              style={{ backgroundColor: colors.background }}
            >
              <ModalHeader title="Catat Hutang/Piutang" onClose={onClose} />

              <ScrollView>
                <View className="flex-row gap-3 mb-6">
                  <TypeOption val="receivable" label="Piutang" />
                  <TypeOption val="payable" label="Hutang" />
                </View>

                <AppInput
                  label="Nama Orang"
                  placeholder="Contoh: Budi, Warung Kopi"
                  value={personName}
                  onChangeText={setPersonName}
                />
                <CurrencyInput
                  label="Nominal"
                  value={amount}
                  onChangeText={setAmount}
                />

                <View className="mt-2 mb-4">
                  <AppText variant="label" className="mb-2">
                    Janji Bayar (Jatuh Tempo)
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisibility(true)}
                    className="p-4 rounded-xl flex-row justify-between items-center border"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <AppText>
                      {dueDate.toLocaleDateString("id-ID", {
                        dateStyle: "full",
                      })}
                    </AppText>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.icon}
                    />
                  </TouchableOpacity>
                </View>

                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirmDate}
                  onCancel={() => setDatePickerVisibility(false)}
                  confirmTextIOS="Pilih"
                  cancelTextIOS="Batal"
                />
              </ScrollView>

              <AppButton
                title="Simpan Catatan"
                onPress={handleSave}
                isLoading={isLoading}
                className="mt-4"
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
