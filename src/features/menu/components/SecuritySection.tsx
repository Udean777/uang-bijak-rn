import { AppText } from "@/src/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, TouchableOpacity, View } from "react-native";
import { MenuSection } from "./MenuSection";

import { useTheme } from "@/src/hooks/useTheme";

interface SecuritySectionProps {
  isBiometricEnabled: boolean;
  onBiometricToggle: (val: boolean) => void;
  isNotificationsEnabled: boolean;
  onNotificationsToggle: (val: boolean) => void;
  onTestNotification: () => void;
}

export const SecuritySection = ({
  isBiometricEnabled,
  onBiometricToggle,
  isNotificationsEnabled,
  onNotificationsToggle,
  onTestNotification,
}: SecuritySectionProps) => {
  const { colors: theme, isDark } = useTheme();
  return (
    <MenuSection title="Keamanan">
      <View
        className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
            }}
          >
            <Ionicons name="finger-print" size={20} color="#10B981" />
          </View>
          <View>
            <AppText weight="bold">Biometrik</AppText>
            <AppText variant="caption">Kunci aplikasi saat keluar</AppText>
          </View>
        </View>
        <Switch
          value={isBiometricEnabled}
          onValueChange={onBiometricToggle}
          trackColor={{ false: "#767577", true: theme.primary }}
          thumbColor={isBiometricEnabled ? "#ffffff" : "#f4f3f4"}
        />
      </View>

      <View
        className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#DBEAFE",
            }}
          >
            <Ionicons name="notifications" size={20} color="#3B82F6" />
          </View>
          <View>
            <AppText weight="bold">Notifikasi</AppText>
            <AppText variant="caption">Pengingat tagihan & utang</AppText>
          </View>
        </View>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={onNotificationsToggle}
          trackColor={{ false: "#767577", true: theme.primary }}
          thumbColor={isNotificationsEnabled ? "#ffffff" : "#f4f3f4"}
        />
      </View>

      {isNotificationsEnabled && (
        <TouchableOpacity
          onPress={onTestNotification}
          className="flex-row items-center justify-center p-3 rounded-xl border border-dashed mb-3"
          style={{ borderColor: theme.primary }}
        >
          <Ionicons
            name="send-outline"
            size={18}
            color={theme.primary}
            className="mr-2"
          />
          <AppText weight="bold" style={{ color: theme.primary }}>
            Kirim Notifikasi Tes
          </AppText>
        </TouchableOpacity>
      )}
    </MenuSection>
  );
};
