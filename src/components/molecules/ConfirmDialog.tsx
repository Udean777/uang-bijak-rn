import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Modal, View } from "react-native";
import { AppButton } from "../atoms/AppButton";
import { AppText } from "../atoms/AppText";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
  isLoading?: boolean;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "primary",
  isLoading = false,
  showCancel = true,
  onConfirm,
  onCancel,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 justify-center items-center p-5"
        style={{ backgroundColor: theme.modalOverlay }}
      >
        <View
          className="rounded-2xl p-6 w-full max-w-sm shadow-xl"
          style={{ backgroundColor: theme.background }}
        >
          <AppText variant="h3" weight="bold" className="mb-2 text-center">
            {title}
          </AppText>

          <AppText className="text-center mb-6 leading-5">{message}</AppText>

          <View className="flex-row gap-3">
            {showCancel && (
              <View className="flex-1">
                <AppButton
                  title={cancelText}
                  variant={isDark ? "ghost" : "outline"}
                  onPress={onCancel}
                  disabled={isLoading}
                />
              </View>
            )}
            <View className="flex-1">
              <AppButton
                title={confirmText}
                variant={variant === "danger" ? "danger" : "primary"}
                onPress={onConfirm}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
