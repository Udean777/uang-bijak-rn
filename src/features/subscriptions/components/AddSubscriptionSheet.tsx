import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
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

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
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
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="bg-white rounded-t-3xl h-[70%] w-full">
              <View className="items-center pt-4 pb-2">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </View>

              <View className="px-5 pb-4 flex-row justify-between items-center border-b border-gray-100">
                <View>
                  <AppText variant="h3" weight="bold">
                    Tambah Langganan
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Catat tagihan rutin bulanan
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Ionicons name="close" size={20} color="gray" />
                </TouchableOpacity>
              </View>

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

                <View className="p-5 border-t border-gray-100 pb-10">
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
