import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import { Modal, View } from "react-native";
import { AppSpinner } from "../atoms/AppSpinner";
import { AppText } from "../atoms/AppText";

interface ScreenLoaderProps {
  visible: boolean;
  text?: string;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({
  visible,
  text = "Loading...",
}) => {
  const { colors } = useTheme();

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.modalOverlay }}
      >
        <View
          className="p-6 rounded-2xl items-center shadow-lg min-w-[150px]"
          style={{ backgroundColor: colors.background }}
        >
          <AppSpinner size="large" />
          <AppText
            variant="label"
            weight="medium"
            className="mt-4"
            style={{ color: colors.textSecondary }}
          >
            {text}
          </AppText>
        </View>
      </View>
    </Modal>
  );
};
