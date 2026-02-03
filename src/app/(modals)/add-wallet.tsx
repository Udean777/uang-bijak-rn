import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAddWallet } from "@/src/features/wallets/hooks/useAddWallet";
import { useTheme } from "@/src/hooks/useTheme";
import { WalletType } from "@/src/types/wallet";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

const TypeOption = ({
  type,
  label,
  icon,
  selectedType,
  onSelect,
}: {
  type: WalletType;
  label: string;
  icon: React.ReactElement;
  selectedType: WalletType;
  onSelect: (type: WalletType) => void;
}) => {
  const { colors, isDark } = useTheme();
  const isActive = selectedType === type;

  return (
    <TouchableOpacity
      onPress={() => onSelect(type)}
      className="flex-1 items-center p-3 rounded-xl border"
      style={{
        backgroundColor: isActive
          ? isDark
            ? "rgba(37, 99, 235, 0.1)"
            : "#EFF6FF"
          : colors.surface,
        borderColor: isActive ? colors.primary : colors.border,
      }}
    >
      {React.cloneElement(icon, {
        color: isActive ? colors.primary : colors.icon,
      } as any)}
      <AppText
        variant="caption"
        className="mt-2"
        weight={isActive ? "bold" : "regular"}
        style={{ color: isActive ? colors.primary : colors.text }}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

export default function AddWalletScreen() {
  const { colors, isDark } = useTheme();

  const {
    name,
    setName,
    initialBalance,
    handleBalanceChange,
    selectedType,
    setSelectedType,
    selectedColor,
    setSelectedColor,
    isLoading,
    handleSave,
    colors: availableColors,
  } = useAddWallet();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenLoader visible={isLoading} text="Membuat Dompet..." />
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
                Rp {initialBalance || "0"}
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
            <CurrencyInput
              label="Saldo Awal"
              value={initialBalance}
              onChangeText={handleBalanceChange}
            />

            <View>
              <AppText variant="label" className="mb-2" color="secondary">
                Tipe Akun
              </AppText>
              <View className="flex-row gap-3">
                <TypeOption
                  type="bank"
                  label="Bank"
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                  icon={<Ionicons name="business" size={24} />}
                />
                <TypeOption
                  type="e-wallet"
                  label="E-Wallet"
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                  icon={<Ionicons name="phone-portrait" size={24} />}
                />
                <TypeOption
                  type="cash"
                  label="Tunai"
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                  icon={<Ionicons name="cash" size={24} />}
                />
                <TypeOption
                  type="savings"
                  label="Tabungan"
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                  icon={<FontAwesome6 name="piggy-bank" size={22} />}
                />
              </View>
            </View>

            <View>
              <AppText variant="label" className="mb-2" color="secondary">
                Warna
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className="w-10 h-10 rounded-full mr-3 border-2"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        selectedColor === color ? colors.text : "transparent",
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>

        <View
          className="p-5 border-t pb-8"
          style={{ borderTopColor: colors.divider }}
        >
          <AppButton title="Simpan Dompet" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
