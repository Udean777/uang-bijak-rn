import { AppText } from "@/src/components/atoms/AppText";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

interface HorizontalSelectorProps<T> {
  data: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  labelExtractor: (item: T) => string;
  idExtractor: (item: T) => string;
  theme: any;
  isDark: boolean;
  label?: string;
  renderExtra?: () => React.ReactNode;
  activeBgColor?: string;
}

export const HorizontalSelector = <T,>({
  data,
  selectedId,
  onSelect,
  labelExtractor,
  idExtractor,
  theme,
  isDark,
  label,
  renderExtra,
  activeBgColor,
}: HorizontalSelectorProps<T>) => {
  return (
    <View className="mb-6">
      {label && (
        <AppText variant="caption" weight="bold" className="uppercase mb-2">
          {label}
        </AppText>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderExtra && renderExtra()}
        {data.map((item) => {
          const itemId = idExtractor(item);
          const isActive = selectedId === itemId;

          let bgColor = isActive
            ? activeBgColor || theme.primary
            : theme.surface;
          let borderColor = isActive
            ? activeBgColor || theme.primary
            : theme.border;
          let textColor = isActive ? "white" : "default";

          // Special case for dark mode with default grey-ish selections
          if (isActive && isDark && !activeBgColor) {
            bgColor = theme.text;
            borderColor = theme.text;
            textColor = "default";
          }

          return (
            <TouchableOpacity
              key={itemId}
              onPress={() => onSelect(itemId)}
              className="mr-3 px-4 py-2 rounded-full border"
              style={{
                backgroundColor: bgColor,
                borderColor: borderColor,
              }}
            >
              <AppText
                weight="bold"
                color={textColor as any}
                style={
                  isActive && isDark && !activeBgColor
                    ? { color: theme.background }
                    : undefined
                }
              >
                {labelExtractor(item)}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
