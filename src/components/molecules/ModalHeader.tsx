import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  return (
    <View
      className="flex-row items-center justify-between px-5 py-4 border-b"
      style={{
        backgroundColor: theme.background,
        borderBottomColor: theme.divider,
      }}
    >
      <View>
        <AppText variant="h3" weight="bold">
          {title}
        </AppText>
        {subtitle && <AppText variant="caption">{subtitle}</AppText>}
      </View>

      <TouchableOpacity
        onPress={handleClose}
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{ backgroundColor: theme.surface }}
      >
        <Ionicons name="close" size={20} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};
