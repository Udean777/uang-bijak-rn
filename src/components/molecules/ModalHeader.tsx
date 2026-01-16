import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "../atoms/AppText";

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  onClose,
}) => {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  return (
    <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
      <View>
        <AppText variant="h3" weight="bold">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color="secondary">
            {subtitle}
          </AppText>
        )}
      </View>

      <TouchableOpacity
        onPress={handleClose}
        className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
      >
        <Ionicons name="close" size={20} color="#374151" />
      </TouchableOpacity>
    </View>
  );
};
