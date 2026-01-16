import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AddSubscriptionSheet } from "@/src/features/subscriptions/components/AddSubscriptionSheet";
import { SubscriptionList } from "@/src/features/subscriptions/components/SubscriptionList";
import { AuthService } from "@/src/services/authService";

export default function MenuScreen() {
  const { userProfile } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const onLogoutPress = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setShowLogoutDialog(false);
    await AuthService.logout();
    setIsLoading(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-5"
      >
        <View className="flex-row items-center mb-8 pt-4">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mr-4 border"
            style={{
              backgroundColor: isDark ? "rgba(37, 99, 235, 0.2)" : "#DBEAFE",
              borderColor: isDark ? "rgba(37, 99, 235, 0.5)" : "#BFDBFE",
            }}
          >
            <AppText variant="h2" weight="bold">
              {userProfile?.displayName?.charAt(0) || "U"}
            </AppText>
          </View>
          <View>
            <AppText variant="h2" weight="bold">
              {userProfile?.displayName || "User"}
            </AppText>
            <AppText>{userProfile?.email}</AppText>
          </View>
        </View>

        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <AppText variant="h3" weight="bold">
              Langganan & Tagihan
            </AppText>
            <TouchableOpacity onPress={() => setShowAddSheet(true)}>
              <AppText weight="bold">+ Tambah</AppText>
            </TouchableOpacity>
          </View>

          <SubscriptionList />
        </View>

        <View className="mb-6">
          <AppText variant="h3" weight="bold" className="mb-4">
            Akun
          </AppText>

          <AppButton
            title="Keluar Aplikasi"
            variant="danger"
            onPress={onLogoutPress}
            leftIcon={
              <Ionicons name="log-out-outline" size={20} color="white" />
            }
          />
          <AppText variant="caption" className="text-center mt-4">
            Versi Aplikasi 1.0.0 (MVP)
          </AppText>
        </View>
      </ScrollView>

      <AddSubscriptionSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
      />

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Keluar Aplikasi?"
        message="Anda yakin ingin keluar dari aplikasi?"
        confirmText="Keluar"
        cancelText="Batal"
        variant="danger"
        isLoading={isLoading}
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
      />
    </View>
  );
}
