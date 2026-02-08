import { useSettingsStore } from "@/src/features/settings/store/useSettingsStore";
import { useTheme } from "@/src/hooks/useTheme";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { ConfirmDialog } from "../molecules/ConfirmDialog";
import { PinPad } from "../molecules/PinPad";
import { ScreenLoader } from "../molecules/ScreenLoader";
import { useBiometricLock } from "./hooks/useBiometricLock";

interface BiometricLockProps {
  onUnlock: () => void;
}

interface DialogConfig {
  visible?: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function BiometricLock({ onUnlock }: BiometricLockProps) {
  const { colors } = useTheme();
  const { checkBiometricHardware } = useSettingsStore();
  const [showBioButton, setShowBioButton] = useState(false);

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    visible: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Batal",
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const hideDialog = useCallback(() => {
    setDialogConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const showDialog = useCallback(
    (config: DialogConfig) => {
      setDialogConfig({
        ...config,
        visible: true,
        onConfirm: config.onConfirm || hideDialog,
        onCancel: config.onCancel || hideDialog,
      });
    },
    [hideDialog],
  );

  const {
    isAuthenticating,
    error,
    handleBiometricAuthenticate,
    handlePinVerify,
  } = useBiometricLock({ onUnlock });

  useEffect(() => {
    checkBiometricHardware().then(setShowBioButton);
  }, [checkBiometricHardware]);

  const onBiometricPress = () =>
    handleBiometricAuthenticate(showDialog, hideDialog);

  return (
    <View
      className="flex-1 w-full h-full"
      style={{ backgroundColor: colors.background }}
    >
      <PinPad
        title="Masukkan PIN"
        subtitle="Buka kunci aplikasi"
        onVerify={handlePinVerify}
        showBiometricButton={showBioButton}
        onBiometricPress={onBiometricPress}
        error={error}
      />

      <ScreenLoader visible={isAuthenticating} text="Memverifikasi..." />

      <ConfirmDialog
        visible={dialogConfig.visible || false}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        showCancel={dialogConfig.showCancel || false}
        onConfirm={dialogConfig.onConfirm || (() => {})}
        onCancel={dialogConfig.onCancel || (() => {})}
      />
    </View>
  );
}
