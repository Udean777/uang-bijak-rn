import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { DebtService } from "@/src/services/debtService";
import { DebtType } from "@/src/types/debt";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";

interface AddDebtSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AddDebtSheet = ({ visible, onClose }: AddDebtSheetProps) => {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<DebtType>("receivable");

  const [dueDate, setDueDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDate = (date: Date) => {
    setDueDate(date);
    setDatePickerVisibility(false);
  };

  const handleSave = async () => {
    if (!personName || !amount) {
      Toast.show({ type: "error", text1: "Mohon lengkapi nama & nominal" });
      return;
    }
    setIsLoading(true);
    try {
      await DebtService.addDebt(user!.uid, {
        personName,
        amount: parseFloat(amount),
        type,
        dueDate: dueDate.getTime(),
        note: "",
      });
      Toast.show({ type: "success", text1: "Data tersimpan" });

      setPersonName("");
      setAmount("");
      setType("receivable");
      setDueDate(new Date());
      onClose();
    } catch (e) {
      Toast.show({ type: "error", text1: "Gagal menyimpan" });
    } finally {
      setIsLoading(false);
    }
  };

  const TypeOption = ({ val, label }: { val: DebtType; label: string }) => {
    const isSelected = type === val;
    const isReceivable = val === "receivable";

    let bgColor = theme.surface;
    let borderColor = theme.border;
    let textColor: any = "default";

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
              style={{ backgroundColor: theme.background }}
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
                <AppInput
                  label="Nominal (Rp)"
                  placeholder="0"
                  keyboardType="numeric"
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
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
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
                      color={theme.icon}
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
