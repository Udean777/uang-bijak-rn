import { AppText } from "@/src/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface MenuListItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  onPress: () => void;
  theme: any;
  disabled?: boolean;
}

export const MenuListItem = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  onPress,
  theme,
  disabled,
}: MenuListItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View>
          <AppText weight="bold">{title}</AppText>
          <AppText variant="caption">{description}</AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.icon} />
    </TouchableOpacity>
  );
};
