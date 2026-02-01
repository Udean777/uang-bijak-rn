import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { AccountSection } from "@/src/features/menu/components/AccountSection";
import { MenuListItem } from "@/src/features/menu/components/MenuListItem";
import { MenuSection } from "@/src/features/menu/components/MenuSection";
import { SecuritySection } from "@/src/features/menu/components/SecuritySection";
import { UserProfileHeader } from "@/src/features/menu/components/UserProfileHeader";
import { useMenuLogic } from "@/src/features/menu/hooks/useMenuLogic";
import { AddSubscriptionSheet } from "@/src/features/subscriptions/components/AddSubscriptionSheet";
import { SubscriptionList } from "@/src/features/subscriptions/components/SubscriptionList";
import { useTheme } from "@/src/hooks/useTheme";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

export default function MenuScreen() {
  const router = useRouter();
  const { colors: theme, isDark } = useTheme();

  const {
    userProfile,
    showLogoutDialog,
    setShowLogoutDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    showAddSheet,
    setShowAddSheet,
    isLoading,
    isDeleting,
    isExporting,
    isBiometricEnabled,
    isNotificationsEnabled,
    handleLogout,
    handleDeleteAccount,
    toggleBiometric,
    toggleNotifications,
    handleExportData,
    handleTestNotification,
  } = useMenuLogic();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-5"
      >
        <UserProfileHeader
          displayName={userProfile?.displayName || "User"}
          email={userProfile?.email || ""}
        />

        <MenuSection
          title="Langganan & Tagihan"
          actionText="+ Tambah"
          onActionPress={() => setShowAddSheet(true)}
        >
          <SubscriptionList />
        </MenuSection>

        <MenuSection title="Fitur Cerdas">
          <MenuListItem
            icon="flag"
            iconColor="#10B981"
            iconBgColor={isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5"}
            title="Target Menabung"
            description="Mencapai tujuan finansialmu"
            onPress={() => router.push("/(sub)/goals" as any)}
          />
          <MenuListItem
            icon="pie-chart"
            iconColor="#F59E0B"
            iconBgColor={isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7"}
            title="Budget Kategori"
            description="Atur batasan pengeluaran"
            onPress={() => router.push("/(sub)/budgets" as any)}
          />
          <MenuListItem
            icon="heart"
            iconColor="#9333EA"
            iconBgColor={isDark ? "rgba(147, 51, 234, 0.15)" : "#F3E8FF"}
            title="Wishlist & Timer"
            description="Cegah belanja impulsif"
            onPress={() => router.push("/(sub)/wishlist")}
          />
          <MenuListItem
            icon="people"
            iconColor="#0D9488"
            iconBgColor={isDark ? "rgba(13, 148, 136, 0.15)" : "#CCFBF1"}
            title="Hutang & Piutang"
            description="Catat pinjaman teman"
            onPress={() => router.push("/(sub)/debts")}
          />
          <MenuListItem
            icon="repeat"
            iconColor="#8B5CF6"
            iconBgColor={isDark ? "rgba(139, 92, 246, 0.15)" : "#EDE9FE"}
            title="Transaksi Berulang"
            description="Otomasi pemasukan & pengeluaran"
            onPress={() => router.push("/(sub)/recurring" as any)}
          />
          <MenuListItem
            icon="flash"
            iconColor="#F59E0B"
            iconBgColor={isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7"}
            title="Shortcut Transaksi"
            description="Template input cepat"
            onPress={() => router.push("/(sub)/manage-templates")}
          />
        </MenuSection>

        <SecuritySection
          isBiometricEnabled={isBiometricEnabled}
          onBiometricToggle={toggleBiometric}
          isNotificationsEnabled={isNotificationsEnabled}
          onNotificationsToggle={toggleNotifications}
          onTestNotification={handleTestNotification}
        />

        <MenuSection title="Data">
          <MenuListItem
            icon="bar-chart"
            iconColor="#3B82F6"
            iconBgColor={isDark ? "rgba(59, 130, 246, 0.15)" : "#DBEAFE"}
            title="Laporan Bulanan"
            description="Ringkasan keuangan per bulan"
            onPress={() => router.push("/(sub)/reports" as any)}
          />
          <MenuListItem
            icon="download-outline"
            iconColor="#10B981"
            iconBgColor={isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5"}
            title={isExporting ? "Mengexport..." : "Export Transaksi"}
            description="Download data dalam format CSV"
            onPress={handleExportData}
            disabled={isExporting}
          />
        </MenuSection>

        <MenuSection title="Informasi">
          <MenuListItem
            icon="shield-checkmark"
            iconColor="#6B7280"
            iconBgColor={isDark ? "rgba(107, 114, 128, 0.15)" : "#F3F4F6"}
            title="Kebijakan Privasi"
            description="Bagaimana kami menjaga data Anda"
            onPress={() =>
              router.push({
                pathname: "/(sub)/legal",
                params: { type: "privacy" },
              } as any)
            }
          />
          <MenuListItem
            icon="document-text"
            iconColor="#6B7280"
            iconBgColor={isDark ? "rgba(107, 114, 128, 0.15)" : "#F3F4F6"}
            title="Syarat & Ketentuan"
            description="Aturan penggunaan aplikasi"
            onPress={() =>
              router.push({
                pathname: "/(sub)/legal",
                params: { type: "terms" },
              } as any)
            }
          />
        </MenuSection>

        <AccountSection
          onLogout={() => setShowLogoutDialog(true)}
          onDeleteAccount={() => setShowDeleteDialog(true)}
        />
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
        onCancel={() => setShowLogoutDialog(false)}
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Hapus Akun?"
        message="PERINGATAN: Tindakan ini tidak dapat dibatalkan. Semua data keuangan Anda (transaksi, dompet, tagihan, utang, wishlist) akan dihapus secara permanen."
        confirmText="Hapus Akun"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}
