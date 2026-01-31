import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AddSubscriptionSheet } from "@/src/features/subscriptions/components/AddSubscriptionSheet";
import { SubscriptionList } from "@/src/features/subscriptions/components/SubscriptionList";
import { AuthService } from "@/src/services/authService";
import { ExportService } from "@/src/services/ExportService";
import { NotificationService } from "@/src/services/NotificationService";
import { SecurityService } from "@/src/services/SecurityService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function MenuScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  React.useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    const enabled = await SecurityService.isBiometricEnabled();
    setIsBiometricEnabled(enabled);
  };

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

  const onDeleteAccountPress = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await AuthService.deleteAccount();
      setShowDeleteDialog(false);
      Toast.show({
        type: "success",
        text1: "Akun Dihapus",
        text2: "Semua data Anda telah dihapus.",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Menghapus Akun",
        text2: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const hasHardware = await SecurityService.checkHardware();
      if (!hasHardware) {
        alert(
          "Perangkat Anda tidak mendukung atau belum mengaktifkan fitur biometrik.",
        );
        return;
      }

      // Verifikasi/Trigger permission saat mengaktifkan
      const verified = await SecurityService.authenticateBiometric();
      if (!verified) {
        // Jika batal atau gagal auth, jangan aktifkan
        alert(
          "Gagal memverifikasi biometrik. Pastikan wajah/jari Anda terdeteksi.",
        );
        return;
      }
    }

    await SecurityService.setBiometricEnabled(value);
    setIsBiometricEnabled(value);
  };

  const toggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Toast.show({
          type: "error",
          text1: "Izin Notifikasi Ditolak",
          text2: "Aktifkan notifikasi di pengaturan perangkat.",
        });
        return;
      }
    } else {
      await NotificationService.cancelAllNotifications();
    }
    setIsNotificationsEnabled(value);
  };

  const handleExportData = async () => {
    if (!userProfile?.uid) return;

    setIsExporting(true);
    try {
      await ExportService.exportTransactionsToCSV(userProfile.uid);
      Toast.show({
        type: "success",
        text1: "Export Berhasil",
        text2: "File CSV siap dibagikan.",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Export Gagal",
        text2: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.sendLocalNotification(
        "Tes Notifikasi Berhasil! ✅",
        "Jika Anda melihat ini, berarti sistem notifikasi sudah aktif dan berjalan lancar.",
      );
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Mengirim Tes",
        text2: error.message,
      });
    }
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

        <View className="flex-row justify-between items-center mb-4">
          <AppText variant="h3" weight="bold">
            Fitur Cerdas
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(sub)/goals" as any)}
          className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(16, 185, 129, 0.15)"
                  : "#D1FAE5",
              }}
            >
              <Ionicons name="flag" size={20} color="#10B981" />
            </View>
            <View>
              <AppText weight="bold">Target Menabung</AppText>
              <AppText variant="caption">Mencapai tujuan finansialmu</AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(sub)/budgets" as any)}
          className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(245, 158, 11, 0.15)"
                  : "#FEF3C7",
              }}
            >
              <Ionicons name="pie-chart" size={20} color="#F59E0B" />
            </View>
            <View>
              <AppText weight="bold">Budget Kategori</AppText>
              <AppText variant="caption">Atur batasan pengeluaran</AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(sub)/wishlist")}
          className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(147, 51, 234, 0.15)"
                  : "#F3E8FF",
              }}
            >
              <Ionicons name="heart" size={20} color="#9333EA" />
            </View>
            <View>
              <AppText weight="bold">Wishlist & Timer</AppText>
              <AppText variant="caption">Cegah belanja impulsif</AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(sub)/debts")}
          className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(13, 148, 136, 0.15)"
                  : "#CCFBF1", // teal-100
              }}
            >
              <Ionicons name="people" size={20} color="#0D9488" />
            </View>
            <View>
              <AppText weight="bold">Hutang & Piutang</AppText>
              <AppText variant="caption">Catat pinjaman teman</AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(sub)/recurring" as any)}
          className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(139, 92, 246, 0.15)"
                  : "#EDE9FE",
              }}
            >
              <Ionicons name="repeat" size={20} color="#8B5CF6" />
            </View>
            <View>
              <AppText weight="bold">Transaksi Berulang</AppText>
              <AppText variant="caption">
                Otomasi pemasukan & pengeluaran
              </AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(sub)/manage-templates")}
          className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(245, 158, 11, 0.15)"
                  : "#FEF3C7",
              }}
            >
              <Ionicons name="flash" size={20} color="#F59E0B" />
            </View>
            <View>
              <AppText weight="bold">Shortcut Transaksi</AppText>
              <AppText variant="caption">Template input cepat</AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        <View className="mb-8">
          <AppText variant="h3" weight="bold" className="mb-4">
            Keamanan
          </AppText>

          <View
            className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#D1FAE5",
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
              onValueChange={toggleBiometric}
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
                  backgroundColor: isDark
                    ? "rgba(59, 130, 246, 0.15)"
                    : "#DBEAFE",
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
              onValueChange={toggleNotifications}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={isNotificationsEnabled ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          {isNotificationsEnabled && (
            <TouchableOpacity
              onPress={handleTestNotification}
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
        </View>

        {/* Data Management Section */}
        <View className="mb-8">
          <AppText variant="h3" weight="bold" className="mb-4">
            Data
          </AppText>

          <TouchableOpacity
            onPress={() => router.push("/(sub)/reports" as any)}
            className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? "rgba(59, 130, 246, 0.15)"
                    : "#DBEAFE",
                }}
              >
                <Ionicons name="bar-chart" size={20} color="#3B82F6" />
              </View>
              <View>
                <AppText weight="bold">Laporan Bulanan</AppText>
                <AppText variant="caption">
                  Ringkasan keuangan per bulan
                </AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExportData}
            disabled={isExporting}
            className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              opacity: isExporting ? 0.6 : 1,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#D1FAE5",
                }}
              >
                <Ionicons name="download-outline" size={20} color="#10B981" />
              </View>
              <View>
                <AppText weight="bold">
                  {isExporting ? "Mengexport..." : "Export Transaksi"}
                </AppText>
                <AppText variant="caption">
                  Download data dalam format CSV
                </AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* Legal & Info Section */}
        <View className="mb-8">
          <AppText variant="h3" weight="bold" className="mb-4">
            Informasi
          </AppText>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(sub)/legal",
                params: { type: "privacy" },
              } as any)
            }
            className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? "rgba(107, 114, 128, 0.15)"
                    : "#F3F4F6",
                }}
              >
                <Ionicons name="shield-checkmark" size={20} color="#6B7280" />
              </View>
              <View>
                <AppText weight="bold">Kebijakan Privasi</AppText>
                <AppText variant="caption">
                  Bagaimana kami menjaga data Anda
                </AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(sub)/legal",
                params: { type: "terms" },
              } as any)
            }
            className="flex-row items-center justify-between p-4 rounded-2xl border mb-3"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? "rgba(107, 114, 128, 0.15)"
                    : "#F3F4F6",
                }}
              >
                <Ionicons name="document-text" size={20} color="#6B7280" />
              </View>
              <View>
                <AppText weight="bold">Syarat & Ketentuan</AppText>
                <AppText variant="caption">Aturan penggunaan aplikasi</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <AppText variant="h3" weight="bold" className="mb-4">
            Akun
          </AppText>

          <AppButton
            title="Keluar Aplikasi"
            variant="outline"
            onPress={onLogoutPress}
            leftIcon={
              <Ionicons name="log-out-outline" size={20} color={theme.text} />
            }
            className="mb-3"
          />

          <TouchableOpacity
            onPress={onDeleteAccountPress}
            className="flex-row items-center justify-center p-4 rounded-2xl border"
            style={{
              borderColor: theme.danger,
              backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
            }}
          >
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
            <AppText
              weight="bold"
              className="ml-2"
              style={{ color: theme.danger }}
            >
              Hapus Akun
            </AppText>
          </TouchableOpacity>
          <AppText variant="caption" className="mt-2 text-center">
            Menghapus akun akan menghapus semua data Anda secara permanen.
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

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Hapus Akun?"
        message="PERINGATAN: Tindakan ini tidak dapat dibatalkan. Semua data keuangan Anda (transaksi, dompet, tagihan, utang, wishlist) akan dihapus secara permanen."
        confirmText="Hapus Akun"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
