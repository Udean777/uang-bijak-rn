import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAddSubscription } from "@/src/features/subscriptions/hooks/useAddSubscription";
import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { ScrollView, View } from "react-native";

export default function AddSubscriptionScreen() {
  const { colors: theme } = useTheme();

  const {
    name,
    setName,
    cost,
    setCost,
    dueDate,
    setDueDate,
    isLoading,
    handleSave,
    onClose,
  } = useAddSubscription();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenLoader visible={isLoading} />
      <ModalHeader
        title="Tambah Langganan"
        subtitle="Catat tagihan rutin bulanan"
        onClose={onClose}
      />

      <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
        <AppInput
          label="Nama Layanan"
          placeholder="Netflix, Spotify, Indihome"
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

        <AppButton title="Simpan" onPress={handleSave} className="mt-4" />
      </ScrollView>
    </View>
  );
}
