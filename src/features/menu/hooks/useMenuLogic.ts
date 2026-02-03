import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AuthService } from "@/src/services/authService";
import { ExportService } from "@/src/services/ExportService";
import { NotificationService } from "@/src/services/NotificationService";
import { SecurityService } from "@/src/services/SecurityService";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export const useMenuLogic = () => {
  const { userProfile } = useAuth();

  // UI Dialog States
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Edit States
  const [editingSubscription, setEditingSubscription] = useState<any | null>(
    null,
  );

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Settings States
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadBiometricStatus();
    loadNotificationStatus();
  }, []);

  const loadBiometricStatus = async () => {
    const enabled = await SecurityService.isBiometricEnabled();
    setIsBiometricEnabled(enabled);
  };

  const loadNotificationStatus = async () => {
    const enabled = await NotificationService.isNotificationsEnabled();
    setIsNotificationsEnabled(enabled);
  };

  const handleOpenAddSubscription = () => {
    setEditingSubscription(null);
    setShowAddSheet(true);
  };

  const handleEditSubscription = (sub: any) => {
    setEditingSubscription(sub);
    setShowAddSheet(true);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setShowLogoutDialog(false);
    try {
      await AuthService.logout();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Keluar",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const hasHardware = await SecurityService.checkHardware();
      if (!hasHardware) {
        alert(
          "Perangkat Anda tidak mendukung atau belum mengaktifkan fitur biometrik.",
        );
        return;
      }

      const verified = await SecurityService.authenticateBiometric();
      if (!verified) {
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
    await NotificationService.setNotificationsEnabled(value);
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

  return {
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
    editingSubscription,
    handleOpenAddSubscription,
    handleEditSubscription,
  };
};
