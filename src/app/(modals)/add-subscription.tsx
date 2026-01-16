import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        text2: "Masukkan tanggal 1-31",
      });
      return;
    }

    setIsLoading(true);
    try {
      await SubscriptionService.addSubscription(user!.uid, {
        name,
        cost: parseFloat(cost),
        dueDate: dateNum,
      });
      Toast.show({ type: "success", text1: "Langganan Disimpan" });
      router.back();
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const onClose = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenLoader visible={isLoading} />
      <ModalHeader
        title="Tambah Langganan"
        subtitle="Catat tagihan rutin bulanan"
        onClose={onClose}
      />

      <ScrollView className="p-5">
        <AppInput
          label="Nama Layanan"
          placeholder="Netflix, Spotify, Indihome"
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

        <AppButton title="Simpan" onPress={handleSave} className="mt-4" />
      </ScrollView>
    </View>
  );
}
