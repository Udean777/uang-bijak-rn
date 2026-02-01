import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { MenuSection } from "./MenuSection";

interface AccountSectionProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
  theme: any;
  isDark: boolean;
}

export const AccountSection = ({
  onLogout,
  onDeleteAccount,
  theme,
  isDark,
}: AccountSectionProps) => {
  return (
    <MenuSection title="Akun">
      <AppButton
        title="Keluar Aplikasi"
        variant="outline"
        onPress={onLogout}
        leftIcon={
          <Ionicons name="log-out-outline" size={20} color={theme.text} />
        }
        className="mb-3"
      />

      <TouchableOpacity
        onPress={onDeleteAccount}
        className="flex-row items-center justify-center p-4 rounded-2xl border"
        style={{
          borderColor: theme.danger,
          backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
        }}
      >
        <Ionicons name="trash-outline" size={20} color={theme.danger} />
        <AppText weight="bold" className="ml-2" style={{ color: theme.danger }}>
          Hapus Akun
        </AppText>
      </TouchableOpacity>
      <AppText variant="caption" className="mt-2 text-center">
        Menghapus akun akan menghapus semua data Anda secara permanen.
      </AppText>
    </MenuSection>
  );
};
