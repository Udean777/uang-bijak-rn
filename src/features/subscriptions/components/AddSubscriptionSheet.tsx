import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { SubscriptionService } from "@/src/services/subscriptionService";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface AddSubscriptionSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AddSubscriptionSheet = ({
  visible,
  onClose,
}: AddSubscriptionSheetProps) => {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setName("");
      setCost("");
      setDueDate("");
    }
  }, [visible]);

  const handleSave = async () => {
    if (!name || !cost || !dueDate) {
      Toast.show({ type: "error", text1: "Mohon Lengkapi Data" });
      return;
    }

    const dateNum = parseInt(dueDate);
    if (isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
      Toast.show({
        type: "error",
        text1: "Tanggal tidak valid",
        text2: "Masukkan tanggal antara 1 - 31",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (user) {
        await SubscriptionService.addSubscription(user.uid, {
          name,
          cost: parseFloat(cost),
          dueDate: dateNum,
        });
        Toast.show({ type: "success", text1: "Langganan Disimpan" });
        onClose();
      }
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

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
          style={{ backgroundColor: theme.modalOverlay }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              className="rounded-t-3xl h-[70%] w-full"
              style={{ backgroundColor: theme.background }}
            >
              <View className="items-center pt-4 pb-2">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
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
                  style={{ borderTopColor: theme.border }}
                >
                  <AppButton
                    title="Simpan Langganan"
                    onPress={handleSave}
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
