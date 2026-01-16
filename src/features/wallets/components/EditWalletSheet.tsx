import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { WalletService } from "@/src/services/walletService";
import { Wallet, WalletType } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#1F2937",
];

interface EditWalletSheetProps {
  visible: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

export const EditWalletSheet = ({
  visible,
  onClose,
  wallet,
}: EditWalletSheetProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [selectedType, setSelectedType] = useState<WalletType>("bank");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet && visible) {
      setName(wallet.name);
      setBalance(wallet.balance.toString());
      setSelectedType(wallet.type);
      setSelectedColor(wallet.color);
    }
  }, [wallet, visible]);

  const handleUpdate = async () => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      await WalletService.updateWallet(wallet.id, {
        name,
        type: selectedType,
        color: selectedColor,
        balance: parseFloat(balance),
      } as any);

      Toast.show({ type: "success", text1: "Dompet Berhasil Diupdate" });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Update",
        text2: error.message,
      });
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
          selectedType === type ? "rgba(37, 99, 235, 0.1)" : theme.background,
        borderColor: selectedType === type ? theme.primary : theme.border,
      }}
    >
      <Ionicons
        name={icon}
        size={24}
        color={selectedType === type ? theme.primary : theme.icon}
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
              className="rounded-t-3xl h-[85%] w-full"
              style={{ backgroundColor: theme.background }}
            >
              <View className="items-center pt-4 pb-2">
                <View
                  className="w-12 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.border }}
                />
              </View>

              <View
                className="px-5 pb-4 flex-row justify-between items-center border-b"
                style={{ borderBottomColor: theme.divider }}
              >
                <AppText variant="h3" weight="bold">
                  Edit Dompet
                </AppText>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: theme.surface }}
                >
                  <Ionicons name="close" size={20} color={theme.icon} />
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
              >
                <ScrollView className="flex-1 p-5">
                  <View
                    className="w-full h-32 rounded-2xl p-5 justify-between mb-6 shadow-sm"
                    style={{
                      backgroundColor: selectedColor,
                      shadowOpacity: isDark ? 0.3 : 0.1,
                    }}
                  >
                    <View className="flex-row justify-between">
                      <Ionicons name="wallet" size={24} color="white" />
                      <AppText
                        weight="bold"
                        color="white"
                        className="uppercase"
                      >
                        {selectedType}
                      </AppText>
                    </View>
                    <View>
                      <AppText
                        weight="medium"
                        color="white"
                        className="text-xs"
                      >
                        Preview Saldo
                      </AppText>
                      <AppText weight="bold" color="white" className="text-2xl">
                        Rp{" "}
                        {balance
                          ? parseFloat(balance).toLocaleString("id-ID")
                          : "0"}
                      </AppText>
                    </View>
                  </View>

                  <View className="gap-y-5 pb-10">
                    <AppInput
                      label="Nama Dompet"
                      value={name}
                      onChangeText={setName}
                      placeholder="Contoh: Tabungan Nikah"
                    />

                    <AppInput
                      label="Koreksi Saldo (Manual)"
                      value={balance}
                      onChangeText={setBalance}
                      keyboardType="numeric"
                      placeholder="0"
                    />

                    <View>
                      <AppText variant="label" className="mb-2">
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
                      <AppText variant="label" className="mb-2">
                        Warna
                      </AppText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {COLORS.map((color) => (
                          <TouchableOpacity
                            key={color}
                            onPress={() => setSelectedColor(color)}
                            className="w-10 h-10 rounded-full mr-3 border-2"
                            style={{
                              backgroundColor: color,
                              borderColor:
                                selectedColor === color
                                  ? theme.text
                                  : "transparent",
                            }}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </ScrollView>

                <View
                  className="p-5 border-t pb-10"
                  style={{ borderTopColor: theme.divider }}
                >
                  <AppButton
                    title="Simpan Perubahan"
                    onPress={handleUpdate}
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
