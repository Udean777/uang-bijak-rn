import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { TransactionService } from "@/src/services/transactionService";
import { Subscription } from "@/src/types/subscription";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppCard } from "@/src/components/atoms/AppCard";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

const formatDateFull = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getDaysLeft = (targetTimestamp: number) => {
  const now = new Date();
  const target = new Date(targetTimestamp);

  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const SubscriptionList = () => {
  const { user } = useAuth();
  const { wallets } = useWallets();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  // Delete State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = SubscriptionService.subscribeSubscriptions(
      user.uid,
      (data) => {
        const sorted = data.sort(
          (a, b) => (a.nextPaymentDate || 0) - (b.nextPaymentDate || 0),
        );
        setSubs(sorted);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId)
      setSelectedWalletId(wallets[0].id);
  }, [wallets]);

  const handleConfirmPay = async () => {
    if (!user || !selectedSub || !selectedWalletId) return;

    try {
      await TransactionService.addTransaction(user.uid, {
        amount: selectedSub.cost,
        category: "Tagihan",
        classification: "need",
        date: new Date(),
        note: `Bayar Langganan: ${selectedSub.name}`,
        type: "expense",
        walletId: selectedWalletId,
      });

      const currentNextDate = selectedSub.nextPaymentDate || Date.now();
      await SubscriptionService.renewSubscription(
        selectedSub.id,
        currentNextDate,
        selectedSub.dueDate,
      );

      Toast.show({
        type: "success",
        text1: "Tagihan Lunas!",
        text2: "Jadwal diperbarui ke bulan depan.",
      });
      setPayModalVisible(false);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    }
  };

  const onPayPress = (sub: Subscription) => {
    setSelectedSub(sub);
    setPayModalVisible(true);
  };

  const onDeletePress = (sub: Subscription) => {
    setSubToDelete(sub);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subToDelete) return;
    setIsDeleting(true);
    try {
      await SubscriptionService.deleteSubscription(subToDelete.id);
      Toast.show({ type: "success", text1: "Berhasil Dihapus" });
      setShowDeleteDialog(false);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return <Skeleton variant="box" height={100} className="w-full" />;

  const totalCost = subs.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <View>
      <View
        className="p-5 rounded-2xl mb-4 flex-row justify-between items-center shadow-lg"
        style={{
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
          shadowOpacity: isDark ? 0.4 : 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
        }}
      >
        <View>
          <AppText variant="caption" color="white" className="mb-1">
            Estimasi Tagihan Bulanan
          </AppText>
          <AppText variant="h2" weight="bold" color="white">
            {formatRupiah(totalCost)}
          </AppText>
        </View>
        <View className="bg-white/20 p-2 rounded-lg">
          <Ionicons name="calendar" size={24} color="white" />
        </View>
      </View>

      {subs.length === 0 ? (
        <AppText className="text-center py-4">
          Belum ada langganan aktif.
        </AppText>
      ) : (
        subs.map((item) => {
          const nextDate = item.nextPaymentDate
            ? item.nextPaymentDate
            : Date.now();
          const daysLeft = getDaysLeft(nextDate);

          let statusColor = "";
          let statusText = `${daysLeft} Hari lagi`;
          let bgBadge = "";
          let badgeTextColor = "";

          if (daysLeft < 0) {
            statusColor = "text-red-600";
            statusText = `Telat ${Math.abs(daysLeft)} Hari`;
            bgBadge = isDark ? "rgba(220, 38, 38, 0.2)" : "#FEF2F2";
            badgeTextColor = theme.danger;
          } else if (daysLeft === 0) {
            statusColor = "text-orange-600";
            statusText = "Hari Ini!";
            bgBadge = isDark ? "rgba(245, 158, 11, 0.2)" : "#FFFBEB";
            badgeTextColor = theme.warning;
          } else if (daysLeft <= 3) {
            statusColor = "text-orange-500";
            bgBadge = isDark ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB";
            badgeTextColor = theme.warning;
          } else {
            statusColor = "text-green-600";
            bgBadge = isDark ? "rgba(22, 163, 74, 0.1)" : "#F0FDF4";
            badgeTextColor = theme.success; // Green
          }

          return (
            <AppCard
              key={item.id}
              className="mb-3 flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center border"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                >
                  <AppText weight="bold" className="text-lg">
                    {item.name.charAt(0)}
                  </AppText>
                </View>
                <View className="flex-1">
                  <AppText weight="bold" className="text-base">
                    {item.name}
                  </AppText>

                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={theme.icon}
                    />
                    <AppText variant="caption">
                      {item.nextPaymentDate
                        ? formatDateFull(item.nextPaymentDate)
                        : `Tgl ${item.dueDate} (Set Awal)`}
                    </AppText>
                  </View>
                </View>
              </View>

              <View className="items-end gap-2">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => onDeletePress(item)}
                    className="p-1 px-2 rounded-lg"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(239, 68, 68, 0.1)"
                        : "#FEF2F2",
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={theme.danger}
                    />
                  </TouchableOpacity>
                  <View
                    className="px-2 py-1 rounded-md"
                    style={{ backgroundColor: bgBadge }}
                  >
                    <AppText
                      variant="caption"
                      weight="bold"
                      style={{ color: badgeTextColor }}
                    >
                      {statusText}
                    </AppText>
                  </View>
                </View>

                <AppText weight="bold">{formatRupiah(item.cost)}</AppText>

                <TouchableOpacity
                  onPress={() => onPayPress(item)}
                  className="px-4 py-1.5 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                >
                  <AppText variant="caption" weight="bold" color="white">
                    Bayar
                  </AppText>
                </TouchableOpacity>
              </View>
            </AppCard>
          );
        })
      )}

      <Modal
        visible={payModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPayModalVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: theme.modalOverlay }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: theme.card }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <AppText variant="h3" weight="bold">
                Bayar & Perpanjang
              </AppText>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <View
              className="p-4 rounded-xl mb-6 border"
              style={{
                backgroundColor: isDark ? "rgba(37, 99, 235, 0.1)" : "#EFF6FF",
                borderColor: isDark ? "rgba(37, 99, 235, 0.3)" : "#DBEAFE",
              }}
            >
              <AppText>Tagihan Bulan Ini:</AppText>
              <AppText variant="h2" weight="bold" className="my-1">
                {selectedSub?.name}
              </AppText>
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="arrow-forward-circle"
                  size={16}
                  color={theme.info}
                />
                <AppText>Akan diperbarui ke bulan depan.</AppText>
              </View>
            </View>

            <AppText weight="bold" className="mb-3">
              Bayar Pakai:
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {wallets.map((w) => {
                const isSelected = selectedWalletId === w.id;
                return (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => setSelectedWalletId(w.id)}
                    className="mr-3 p-4 rounded-xl border w-36"
                    style={{
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    }}
                  >
                    <AppText
                      color={isSelected ? "white" : "default"}
                      weight="bold"
                    >
                      {w.name}
                    </AppText>
                    <AppText
                      color={isSelected ? "white" : "default"}
                      variant="caption"
                    >
                      {formatRupiah(w.balance)}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <AppButton
              title={`Bayar ${selectedSub ? formatRupiah(selectedSub.cost) : ""}`}
              onPress={handleConfirmPay}
            />
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Hapus Langganan?"
        message={`Apakah Anda yakin ingin menghapus ${subToDelete?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
};
