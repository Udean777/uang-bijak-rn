import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { WalletService } from "@/src/services/walletService";
import { WalletType } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#1F2937",
];

export default function AddWalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [selectedType, setSelectedType] = useState<WalletType>("bank");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editWalletId, setEditWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (params.editData) {
      try {
        const data = JSON.parse(params.editData as string);
        setIsEditMode(true);
        setEditWalletId(data.id);

        setName(data.name);
        setInitialBalance(data.balance.toString());
        setSelectedType(data.type);
        setSelectedColor(data.color);
      } catch (e) {
        console.error(e);
      }
    }
  }, [params.editData]);

  const handleSave = async () => {
    if (!name || !initialBalance) {
      Toast.show({
        type: "error",
        text1: "Mohon Lengkapi Data",
        text2: "Nama dan Saldo wajib diisi.",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && editWalletId) {
        await WalletService.updateWallet(editWalletId, {
          name,
          type: selectedType,
          color: selectedColor,
          balance: parseFloat(initialBalance),
        } as any);

        Toast.show({ type: "success", text1: "Dompet Diupdate" });

        router.dismissAll();
      } else {
        await WalletService.createWallet(user!.uid, {
          name,
          type: selectedType,
          initialBalance: parseFloat(initialBalance),
          color: selectedColor,
        });

        Toast.show({
          type: "success",
          text1: "Berhasil!",
          text2: "Dompet baru telah dibuat.",
        });

        setTimeout(() => router.back(), 1000);
      }
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const TypeOption = ({
    type,
    label,
    icon,
  }: {
    type: WalletType;
    label: string;
    icon: any;
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedType(type)}
      className={`flex-1 items-center p-3 rounded-xl border ${
        selectedType === type
          ? "bg-blue-50 border-blue-600"
          : "bg-white border-gray-200"
      }`}
    >
      <Ionicons
        name={icon}
        size={24}
        color={selectedType === type ? "#2563EB" : "#9CA3AF"}
      />
      <AppText
        variant="caption"
        className="mt-2"
        weight={selectedType === type ? "bold" : "regular"}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <ScreenLoader visible={isLoading} text="Membuat Dompet..." />
      <ModalHeader
        title={isEditMode ? "Edit Dompet" : "Tambah Dompet"}
        subtitle="Atur sumber dana baru"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-5">
          <View
            className="w-full h-40 rounded-2xl p-5 justify-between mb-8 shadow-sm"
            style={{ backgroundColor: selectedColor }}
          >
            <View className="flex-row justify-between">
              <Ionicons name="wallet" size={24} color="white" />
              <AppText className="text-white/80 uppercase font-bold text-xs">
                {selectedType}
              </AppText>
            </View>
            <View>
              <AppText className="text-white/80 text-sm">Saldo</AppText>
              <AppText className="text-white text-3xl font-bold">
                Rp{" "}
                {initialBalance
                  ? parseInt(initialBalance).toLocaleString("id-ID")
                  : "0"}
              </AppText>
              <AppText className="text-white font-medium mt-2">
                {name || "Nama Dompet"}
              </AppText>
            </View>
          </View>

          <View className="gap-y-4">
            <AppInput
              label="Nama Dompet"
              placeholder="Contoh: BCA, Gopay"
              value={name}
              onChangeText={setName}
            />
            <AppInput
              label={isEditMode ? "Koreksi Saldo Saat Ini" : "Saldo Awal"}
              placeholder="0"
              keyboardType="numeric"
              value={initialBalance}
              onChangeText={setInitialBalance}
            />

            <View>
              <AppText variant="label" className="mb-2 text-gray-700">
                Tipe Akun
              </AppText>
              <View className="flex-row gap-3">
                <TypeOption type="bank" label="Bank" icon="business" />
                <TypeOption
                  type="e-wallet"
                  label="E-Wallet"
                  icon="phone-portrait"
                />
                <TypeOption type="cash" label="Tunai" icon="cash" />
              </View>
            </View>

            <View>
              <AppText variant="label" className="mb-2 text-gray-700">
                Warna
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full mr-3 border-2 ${selectedColor === color ? "border-gray-800" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>

        <View className="p-5 border-t border-gray-100 pb-8">
          <AppButton
            title={isEditMode ? "Simpan Perubahan" : "Simpan Dompet"}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
