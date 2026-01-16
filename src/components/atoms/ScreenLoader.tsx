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
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/40 justify-center items-center">
        <View className="bg-white p-6 rounded-2xl items-center shadow-lg min-w-[150px]">
          <AppSpinner size="large" />
          <AppText
            variant="label"
            weight="medium"
            className="mt-4 text-gray-600"
          >
            {text}
          </AppText>
        </View>
      </View>
    </Modal>
  );
};
