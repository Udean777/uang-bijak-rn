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
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <AppText variant="h3" weight="bold" className="mb-2 text-center">
            {title}
          </AppText>

          <AppText color="secondary" className="text-center mb-6 leading-5">
            {message}
          </AppText>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <AppButton
                title={cancelText}
                variant="ghost"
                onPress={onCancel}
                disabled={isLoading}
              />
            </View>
            <View className="flex-1">
              <AppButton
                title={confirmText}
                variant={variant === "danger" ? "danger" : "primary"}
                onPress={onConfirm}
                isLoading={isLoading}
                className={
                  variant === "danger" ? "bg-red-50 border-red-50" : ""
                }
                style={
                  variant === "danger"
                    ? { backgroundColor: "#D00000", borderColor: "#D00000" }
                    : {}
                }
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
