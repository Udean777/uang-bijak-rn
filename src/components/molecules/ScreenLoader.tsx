import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { Modal, View } from "react-native";
import { AppSpinner } from "../atoms/AppSpinner";
import { AppText } from "../atoms/AppText";

interface ScreenLoaderProps {
  visible: boolean;
  text?: string;
  variant?: "default" | "fullscreen";
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({
  visible,
  text = "Loading...",
  variant = "default",
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View
        className="flex-1 justify-center items-center"
        style={{
          backgroundColor:
            variant === "fullscreen" ? colors.background : "rgba(0,0,0,0.5)",
        }}
      >
        {variant === "fullscreen" ? (
          <View className="items-center">
            <View className="mb-8 p-6 bg-blue-50 rounded-full dark:bg-blue-900/20">
              <AppSpinner size="large" />
            </View>
            <AppText variant="h2" weight="bold" className="mb-2">
              Uang Bijak
            </AppText>
            <AppText color="secondary" className="text-center px-10">
              {text}
            </AppText>
          </View>
        ) : (
          <View
            className="p-6 rounded-2xl items-center shadow-lg min-w-[150px]"
            style={{ backgroundColor: colors.surface }}
          >
            <AppSpinner size="large" />
            <AppText
              variant="label"
              weight="medium"
              className="mt-4 text-center"
              style={{ color: colors.textSecondary }}
            >
              {text}
            </AppText>
          </View>
        )}
      </View>
    </Modal>
  );
};
