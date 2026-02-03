import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAddSubscription } from "@/src/features/subscriptions/hooks/useAddSubscription";
import { useTheme } from "@/src/hooks/useTheme";
import { Subscription } from "@/src/types/subscription";
import React, { useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface AddSubscriptionSheetProps {
  visible: boolean;
  onClose: () => void;
  editingSubscription?: Subscription | null;
}

export const AddSubscriptionSheet = ({
  visible,
  onClose,
  editingSubscription,
}: AddSubscriptionSheetProps) => {
  const { colors, isDark } = useTheme();

  const {
    name,
    setName,
    cost,
    setCost,
    dueDate,
    setDueDate,
    isLoading,
    handleSave,
  } = useAddSubscription(editingSubscription);

  // Sync state when editingSubscription changes or visibility toggles
  // Implementation moved inside the hook via useEffect on editingSubscription
  // But we might want to clear form if visible becomes true and editingSubscription is null (Add Mode)
  useEffect(() => {
    if (visible && !editingSubscription) {
      setName("");
      setCost("");
      setDueDate("");
    }
  }, [visible, editingSubscription, setName, setCost, setDueDate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: colors.modalOverlay }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              className="rounded-t-3xl h-[70%] w-full"
              style={{ backgroundColor: colors.background }}
            >
              <View className="items-center pt-4 pb-2">
                <View
                  className="w-12 h-1.5 rounded-full"
                  style={{ backgroundColor: colors.border }}
                />
              </View>

              <ModalHeader
                title={
                  editingSubscription ? "Edit Langganan" : "Tambah Langganan"
                }
                subtitle="Catat tagihan rutin bulanan"
                onClose={onClose}
              />

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
              >
                <ScrollView className="flex-1 p-5">
                  <View className="gap-y-4">
                    <AppInput
                      label="Nama Layanan"
                      placeholder="Contoh: Netflix, WiFi, Listrik"
                      value={name}
                      onChangeText={setName}
                    />

                    <CurrencyInput
                      label="Biaya Bulanan"
                      value={cost}
                      onChangeText={setCost}
                    />

                    <AppInput
                      label="Tanggal Tagihan (Tgl)"
                      placeholder="Contoh: 5, 25"
                      keyboardType="numeric"
                      maxLength={2}
                      value={dueDate}
                      onChangeText={setDueDate}
                    />
                  </View>
                </ScrollView>

                <View
                  className="p-5 border-t pb-10"
                  style={{ borderTopColor: colors.border }}
                >
                  <AppButton
                    title={
                      editingSubscription
                        ? "Simpan Perubahan"
                        : "Simpan Langganan"
                    }
                    onPress={() => handleSave().then(onClose)}
                    isLoading={isLoading}
                  />
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
