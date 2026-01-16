import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { TransactionService } from "@/src/services/transactionService";
import { Subscription } from "@/src/types/subscription";

import { AppButton } from "@/src/components/atoms/AppButton";
import { AppCard } from "@/src/components/atoms/AppCard";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";

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

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const unsub = SubscriptionService.subscribeSubscriptions(
      user.uid,
      (data) => {
        const sorted = data.sort(
          (a, b) => (a.nextPaymentDate || 0) - (b.nextPaymentDate || 0)
        );
        setSubs(sorted);
        setLoading(false);
      }
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
        selectedSub.dueDate
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

  if (loading)
    return <Skeleton variant="box" height={100} className="w-full" />;

  const totalCost = subs.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <View>
      <View className="bg-indigo-600 p-5 rounded-2xl mb-4 flex-row justify-between items-center shadow-lg shadow-indigo-200">
        <View>
          <AppText variant="caption" color="white" className="opacity-80">
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
        <AppText color="secondary" className="text-center py-4">
          Belum ada langganan aktif.
        </AppText>
      ) : (
        subs.map((item) => {
          const nextDate = item.nextPaymentDate
            ? item.nextPaymentDate
            : Date.now();
          const daysLeft = getDaysLeft(nextDate);

          let statusColor = "text-gray-500";
          let statusText = `${daysLeft} Hari lagi`;
          let bgBadge = "bg-gray-100";

          if (daysLeft < 0) {
            statusColor = "text-red-600";
            statusText = `Telat ${Math.abs(daysLeft)} Hari`;
            bgBadge = "bg-red-50";
          } else if (daysLeft === 0) {
            statusColor = "text-orange-600";
            statusText = "Hari Ini!";
            bgBadge = "bg-orange-50";
          } else if (daysLeft <= 3) {
            statusColor = "text-orange-500";
            bgBadge = "bg-orange-50";
          } else {
            statusColor = "text-green-600";
            bgBadge = "bg-green-50";
          }

          return (
            <AppCard
              key={item.id}
              className="mb-3 flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
                  <AppText weight="bold" className="text-gray-500 text-lg">
                    {item.name.charAt(0)}
                  </AppText>
                </View>
                <View className="flex-1">
                  <AppText weight="bold" className="text-base">
                    {item.name}
                  </AppText>

                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="calendar-outline" size={12} color="gray" />
                    <AppText variant="caption" color="secondary">
                      {item.nextPaymentDate
                        ? formatDateFull(item.nextPaymentDate)
                        : `Tgl ${item.dueDate} (Set Awal)`}
                    </AppText>
                  </View>
                </View>
              </View>

              <View className="items-end gap-2">
                <View className={`px-2 py-1 rounded-md ${bgBadge}`}>
                  <AppText
                    variant="caption"
                    weight="bold"
                    className={statusColor}
                  >
                    {statusText}
                  </AppText>
                </View>

                <AppText weight="bold" className="text-gray-900">
                  {formatRupiah(item.cost)}
                </AppText>

                <TouchableOpacity
                  onPress={() => onPayPress(item)}
                  className="bg-indigo-600 px-4 py-1.5 rounded-full"
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
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <AppText variant="h3" weight="bold">
                Bayar & Perpanjang
              </AppText>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <AppText color="secondary">Tagihan Bulan Ini:</AppText>
              <AppText
                variant="h2"
                weight="bold"
                className="text-blue-700 my-1"
              >
                {selectedSub?.name}
              </AppText>
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="arrow-forward-circle"
                  size={16}
                  color="#1D4ED8"
                />
                <AppText className="text-blue-700">
                  Akan diperbarui ke bulan depan.
                </AppText>
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
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setSelectedWalletId(w.id)}
                  className={`mr-3 p-4 rounded-xl border w-36 ${
                    selectedWalletId === w.id
                      ? "bg-gray-900 border-gray-900"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <AppText
                    color={selectedWalletId === w.id ? "white" : "default"}
                    weight="bold"
                  >
                    {w.name}
                  </AppText>
                  <AppText
                    color={selectedWalletId === w.id ? "white" : "secondary"}
                    variant="caption"
                  >
                    {formatRupiah(w.balance)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <AppButton
              title={`Bayar ${selectedSub ? formatRupiah(selectedSub.cost) : ""}`}
              onPress={handleConfirmPay}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
