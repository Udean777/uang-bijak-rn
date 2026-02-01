import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAddSubscription } from "@/src/features/subscriptions/hooks/useAddSubscription";
import { useTheme } from "@/src/hooks/useTheme";
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
}

export const AddSubscriptionSheet = ({
  visible,
  onClose,
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
  } = useAddSubscription();

  // Reset form when visible changes is handled inside the hook or here?
  // The hook seems to lack a 'reset' or useEffect for visibility.
  // We can add it here or in the hook. For now, let's keep it clean here.
  useEffect(() => {
    if (visible) {
      setName("");
      setCost("");
      setDueDate("");
    }
  }, [visible, setName, setCost, setDueDate]);

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
                title="Tambah Langganan"
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

                    <AppInput
                      label="Biaya Bulanan (Rp)"
                      placeholder="0"
                      keyboardType="numeric"
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
                    title="Simpan Langganan"
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
