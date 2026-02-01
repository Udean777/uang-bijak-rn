import { AppText } from "@/src/components/atoms/AppText";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface MenuSectionProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
}

export const MenuSection = ({
  title,
  actionText,
  onActionPress,
  children,
}: MenuSectionProps) => {
  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <AppText variant="h3" weight="bold">
          {title}
        </AppText>
        {actionText && onActionPress && (
          <TouchableOpacity onPress={onActionPress}>
            <AppText weight="bold">{actionText}</AppText>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
};
