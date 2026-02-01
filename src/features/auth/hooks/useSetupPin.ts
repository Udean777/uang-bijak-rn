import { useSettingsStore } from "@/src/features/settings/store/useSettingsStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";

interface DialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useSetupPin = () => {
  const router = useRouter();
  const { setPin, checkBiometricHardware, enableBiometric, isLoading } =
    useSettingsStore();

  const [dialog, setDialog] = useState<DialogState>({
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

  const finishSetup = () => {
    router.replace("/(tabs)");
  };

  const handlePinVerified = async (pin: string) => {
    try {
      await setPin(pin);

      Toast.show({
        type: "success",
        text1: "PIN Dibuat",
        text2: "Akses keamanan Anda telah diatur.",
      });

      await offerBiometricSetup();
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal menyimpan PIN.",
      });
    }
  };

  const offerBiometricSetup = async () => {
    const hasHardware = await checkBiometricHardware();
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
          const success = await enableBiometric();
          if (success) {
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

  return {
    isLoading,
    dialog,
    handlePinVerified,
  };
};
