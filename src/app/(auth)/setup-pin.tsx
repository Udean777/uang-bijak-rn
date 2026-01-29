import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { PinPad } from "@/src/components/molecules/PinPad";
import { SecurityService } from "@/src/services/SecurityService";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, View } from "react-native";
import Toast from "react-native-toast-message";

export default function PinSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Batal",
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const hideDialog = () => {
    setDialog((prev) => ({ ...prev, visible: false }));
  };

  const handlePinVerified = async (pin: string) => {
    setIsLoading(true);
    try {
      await SecurityService.setPin(pin);

      Toast.show({
        type: "success",
        text1: "PIN Dibuat",
        text2: "Akses keamanan Anda telah diatur.",
      });

      await offerBiometricSetup();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal menyimpan PIN.",
      });
      setIsLoading(false);
    }
  };

  const offerBiometricSetup = async () => {
    const hasHardware = await SecurityService.checkHardware();
    if (hasHardware) {
      setDialog({
        visible: true,
        title: "Aktifkan Biometrik?",
        message: "Gunakan Face ID / Fingerprint untuk masuk lebih cepat.",
        confirmText: "Aktifkan",
        cancelText: "Nanti Saja",
        showCancel: true,
        onCancel: () => {
          hideDialog();
          finishSetup();
        },
        onConfirm: async () => {
          hideDialog();
          const success = await SecurityService.authenticateBiometric();
          if (success) {
            await SecurityService.setBiometricEnabled(true);
            Toast.show({
              type: "success",
              text1: "Biometrik Aktif",
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Gagal",
              text2: "Verifikasi gagal.",
            });
          }
          finishSetup();
        },
      });
    } else {
      finishSetup();
    }
  };

  const finishSetup = () => {
    setIsLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-1 p-4">
        <PinPad
          isSettingUp
          title="Buat PIN Baru"
          subtitle="Masukkan 6 digit angka untuk keamanan"
          onVerify={handlePinVerified}
        />
        <ConfirmDialog
          visible={dialog.visible}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          showCancel={dialog.showCancel}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      </View>
    </SafeAreaView>
  );
}
