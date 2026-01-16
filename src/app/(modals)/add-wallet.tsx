import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { WalletService } from "@/src/services/walletService";
import { WalletType } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [selectedType, setSelectedType] = useState<WalletType>("bank");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

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

      // Kembali ke halaman sebelumnya
      router.back();
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
      className="flex-1 items-center p-3 rounded-xl border"
      style={{
        backgroundColor:
          selectedType === type
            ? isDark
              ? "rgba(37, 99, 235, 0.1)"
              : "#EFF6FF"
            : theme.surface,
        borderColor: selectedType === type ? "#2563EB" : theme.border,
      }}
    >
      <Ionicons
        name={icon}
        size={24}
        color={selectedType === type ? "#2563EB" : theme.icon}
      />
      <AppText
        variant="caption"
        className="mt-2"
        weight={selectedType === type ? "bold" : "regular"}
        style={{ color: selectedType === type ? "#2563EB" : theme.text }}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenLoader visible={isLoading} text="Membuat Dompet..." />

      {/* Header standar tanpa custom close */}
      <ModalHeader title="Tambah Dompet" subtitle="Atur sumber dana baru" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-5">
          {/* Card Preview */}
          <View
            className="w-full h-40 rounded-2xl p-5 justify-between mb-8 shadow-sm"
            style={{
              backgroundColor: selectedColor,
              shadowOpacity: isDark ? 0.3 : 0.1,
            }}
          >
            <View className="flex-row justify-between">
              <Ionicons name="wallet" size={24} color="white" />
              <AppText
                className="uppercase font-bold text-xs"
                color="white"
                style={{ opacity: 0.8 }}
              >
                {selectedType}
              </AppText>
            </View>
            <View>
              <AppText
                className="text-sm"
                color="white"
                style={{ opacity: 0.8 }}
              >
                Saldo Awal
              </AppText>
              <AppText className="text-3xl font-bold" color="white">
                Rp{" "}
                {initialBalance
                  ? parseInt(initialBalance).toLocaleString("id-ID")
                  : "0"}
              </AppText>
              <AppText className="font-medium mt-2" color="white">
                {name || "Nama Dompet"}
              </AppText>
            </View>
          </View>

          {/* Form Inputs */}
          <View className="gap-y-4">
            <AppInput
              label="Nama Dompet"
              placeholder="Contoh: BCA, Gopay"
              value={name}
              onChangeText={setName}
            />
            <AppInput
              label="Saldo Awal"
              placeholder="0"
              keyboardType="numeric"
              value={initialBalance}
              onChangeText={setInitialBalance}
            />

            <View>
              <AppText variant="label" className="mb-2" color="secondary">
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
              <AppText variant="label" className="mb-2" color="secondary">
                Warna
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full mr-3 border-2 ${selectedColor === color ? "border-gray-800" : "border-transparent"}`}
                    style={{
                      backgroundColor: color,
                      borderColor:
                        selectedColor === color ? theme.text : "transparent",
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>

        <View
          className="p-5 border-t pb-8"
          style={{ borderTopColor: theme.divider }}
        >
          <AppButton title="Simpan Dompet" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
