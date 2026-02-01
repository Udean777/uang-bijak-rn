import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { PinPad } from "@/src/components/molecules/PinPad";
import { useSetupPin } from "@/src/features/auth/hooks/useSetupPin";
import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { SafeAreaView, View } from "react-native";

export default function PinSetupScreen() {
  const { colors } = useTheme();
  const { dialog, handlePinVerified } = useSetupPin();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
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
