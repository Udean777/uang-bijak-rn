import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { SubscriptionList } from "@/src/features/subscriptions/components/SubscriptionList";
import { AuthService } from "@/src/services/authService";

export default function MenuScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <View className="flex-1 bg-gray-50 ">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-5"
      >
        <View className="flex-row items-center mb-8">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
            <AppText variant="h2" weight="bold" className="text-blue-600">
              {userProfile?.displayName?.charAt(0) || "U"}
            </AppText>
          </View>
          <View>
            <AppText variant="h2" weight="bold">
              {userProfile?.displayName || "User"}
            </AppText>
            <AppText color="secondary">{userProfile?.email}</AppText>
          </View>
        </View>

        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <AppText variant="h3" weight="bold">
              Langganan & Tagihan
            </AppText>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/add-subscription")}
            >
              <AppText color="primary" weight="bold">
                + Tambah
              </AppText>
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
            className="border-red-200"
            onPress={onLogoutPress}
            leftIcon={
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            }
          />
          <AppText
            variant="caption"
            color="secondary"
            className="text-center mt-4"
          >
            Versi Aplikasi 1.0.0 (MVP)
          </AppText>
        </View>
      </ScrollView>

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
