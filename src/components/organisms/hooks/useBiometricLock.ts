import { useSettingsStore } from "@/src/features/settings/store/useSettingsStore";
import { SecurityService } from "@/src/services/SecurityService";
import Haptics from "expo-haptics";
import { useCallback, useState } from "react";

interface UseBiometricLockProps {
  onUnlock: () => void;
}

interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useBiometricLock = ({ onUnlock }: UseBiometricLockProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState("");

  const { isBiometricEnabled, checkBiometricHardware, enableBiometric } =
    useSettingsStore();

  const handleBiometricAuthenticate = useCallback(
    async (
      showDialog: (config: DialogConfig) => void,
      hideDialog: () => void,
    ) => {
      setIsAuthenticating(true);
      setError("");

      const hasHardware = await checkBiometricHardware();

      if (!hasHardware) {
        showDialog({
          title: "Perangkat Biometrik",
          message: "Perangkat Anda tidak mendukung fitur ini.",
          confirmText: "OK",
          onConfirm: hideDialog,
        });
        setIsAuthenticating(false);
        return;
      }

      if (isBiometricEnabled) {
        const success = await SecurityService.authenticateBiometric();
        if (success) {
          onUnlock();
          return;
        }
      } else {
        // Tawarkan untuk mengaktifkan
        showDialog({
          title: "Aktifkan Biometrik?",
          message: "Fitur ini belum aktif. Ingin mengaktifkannya sekarang?",
          confirmText: "Aktifkan",
          cancelText: "Batal",
          showCancel: true,
          onCancel: () => {
            setIsAuthenticating(false);
            hideDialog();
          },
          onConfirm: async () => {
            hideDialog();
            const success = await enableBiometric();
            if (success) {
              onUnlock();
            } else {
              setIsAuthenticating(false);
            }
          },
        });
        return;
      }

      setIsAuthenticating(false);
    },
    [isBiometricEnabled, onUnlock, checkBiometricHardware, enableBiometric],
  );

  const handlePinVerify = useCallback(
    async (pin: string) => {
      setError("");
      const isValid = await SecurityService.validatePin(pin);
      if (isValid) {
        onUnlock();
      } else {
        setError("PIN Salah. Periksa kembali PIN Anda.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [onUnlock],
  );

  return {
    isAuthenticating,
    error,
    handleBiometricAuthenticate,
    handlePinVerify,
  };
};
