import { Colors } from "@/constants/theme";
import { SecurityService } from "@/src/services/SecurityService";
import React, { useEffect, useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { AppText } from "../atoms/AppText";
import { ConfirmDialog } from "../molecules/ConfirmDialog";
import { PinPad } from "../molecules/PinPad";

interface BiometricLockProps {
  onUnlock: () => void;
}

export function BiometricLock({ onUnlock }: BiometricLockProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showBioButton, setShowBioButton] = useState(false);
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

  const handleBiometricAuthenticate = async () => {
    setIsAuthenticating(true);

    // Cek dulu apakah Biometric tersedia & enabled
    const bioEnabled = await SecurityService.isBiometricEnabled();
    const hasHardware = await SecurityService.checkHardware();

    if (bioEnabled && hasHardware) {
      const success = await SecurityService.authenticateBiometric();
      if (success) {
        onUnlock();
        return;
      }
    } else {
      if (!hasHardware) {
        setDialog({
          visible: true,
          title: "Perangkat Biometrik",
          message: "Perangkat Anda tidak mendukung fitur ini.",
          confirmText: "OK",
          cancelText: "",
          showCancel: false,
          onConfirm: hideDialog,
          onCancel: hideDialog,
        });
      } else {
        // Tawarkan untuk mengaktifkan
        setDialog({
          visible: true,
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
            hideDialog(); // Close dialog first or after? Maybe immediately
            const success = await SecurityService.authenticateBiometric();
            if (success) {
              await SecurityService.setBiometricEnabled(true);
              onUnlock();
            } else {
              setIsAuthenticating(false);
            }
          },
        });
        return;
      }
    }

    setIsAuthenticating(false);
  };

  const handlePinVerify = async (pin: string) => {
    const isValid = await SecurityService.validatePin(pin);
    if (isValid) {
      onUnlock();
    } else {
      setDialog({
        visible: true,
        title: "PIN Salah",
        message: "Periksa kembali PIN Anda.",
        confirmText: "OK",
        cancelText: "",
        showCancel: false,
        onConfirm: hideDialog,
        onCancel: hideDialog,
      });
    }
  };

  // Check usage
  useEffect(() => {
    const init = async () => {
      const hasHardware = await SecurityService.checkHardware();
      setShowBioButton(hasHardware);
    };
    init();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PinPad
        title="Masukkan PIN"
        subtitle="Buka kunci aplikasi"
        onVerify={handlePinVerify}
        showBiometricButton={showBioButton}
        onBiometricPress={handleBiometricAuthenticate}
      />

      {isAuthenticating && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <View
            style={{
              padding: 20,
              backgroundColor: theme.card,
              borderRadius: 10,
            }}
          >
            <AppText style={{ fontWeight: "bold" }}>Memverifikasi...</AppText>
          </View>
        </View>
      )}

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
