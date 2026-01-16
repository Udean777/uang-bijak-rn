import { AppButton } from "@/src/components/atoms/AppButton";
import { AppCard } from "@/src/components/atoms/AppCard";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useSafeToSpend } from "@/src/features/budgeting/hooks/useSafeToSpend";
import { WalletCard } from "@/src/features/wallets/components/WalletCard";
import { WalletCardSkeleton } from "@/src/features/wallets/components/WalletCardSkeleton";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { wallets, totalBalance, isLoading: isWalletLoading } = useWallets();
  const {
    safeDaily,
    status,
    remainingDays,
    isLoading: isCalcLoading,
  } = useSafeToSpend();

  const [showInfo, setShowInfo] = useState(false);

  const isLoading = isWalletLoading || isCalcLoading;

  const statusColors = {
    safe: "bg-green-600",
    warning: "bg-yellow-500",
    danger: "bg-red-600",
  };

  const formatRupiah = (value: number) => {
    // Math.floor digunakan untuk membulatkan ke bawah (hapus desimal)
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // Paksa tidak ada koma
    }).format(Math.floor(value));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pb-6 px-5 bg-white rounded-b-3xl shadow-sm z-10">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <AppText variant="label" color="secondary" className="mb-1">
              Halo, Selamat Pagi 👋
            </AppText>
            {userProfile ? (
              <AppText variant="h2" weight="bold" className="capitalize">
                {userProfile.displayName}
              </AppText>
            ) : (
              <Skeleton variant="text" width={150} height={24} />
            )}
          </View>
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Ionicons name="notifications-outline" size={20} color="black" />
          </View>
        </View>

        {isLoading ? (
          <Skeleton
            variant="box"
            width="100%"
            height={140}
            className="rounded-2xl"
          />
        ) : (
          <View
            className={`${statusColors[status]} p-5 rounded-2xl shadow-lg shadow-green-200`}
          >
            <View className="flex-row justify-between items-start">
              <View>
                {/* HEADER DENGAN ICON INFO */}
                <View className="flex-row items-center gap-2 mb-1">
                  <AppText variant="label" className="text-white/80">
                    Safe-to-Spend (Harian)
                  </AppText>

                  {/* Tombol Info (i) */}
                  <TouchableOpacity onPress={() => setShowInfo(true)}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="white"
                      style={{ opacity: 0.8 }}
                    />
                  </TouchableOpacity>
                </View>

                {/* NILAI DIBULATKAN */}
                <AppText variant="h1" weight="bold" color="white">
                  {formatRupiah(safeDaily)}
                </AppText>
              </View>

              <View className="bg-white/20 px-3 py-1 rounded-full">
                <AppText variant="caption" weight="bold" color="white">
                  {remainingDays} Hari Tersisa
                </AppText>
              </View>
            </View>

            <View className="mt-6 pt-4 border-t border-white/20 flex-row justify-between items-center">
              <View>
                <AppText variant="caption" className="text-white/80">
                  Total Saldo Aktif
                </AppText>
                <AppText variant="body" weight="bold" color="white">
                  {formatRupiah(totalBalance)}
                </AppText>
              </View>
              <Ionicons
                name={status === "safe" ? "shield-checkmark" : "alert-circle"}
                size={24}
                color="white"
                opacity={0.8}
              />
            </View>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => {}} />
        }
      >
        <View className="flex-row gap-4 mb-8">
          <AppButton
            title="Transfer"
            variant="secondary"
            className="flex-1"
            size="sm"
            leftIcon={
              <Ionicons name="swap-horizontal" size={16} color="#2563EB" />
            }
          />
          <AppButton
            title="Laporan"
            variant="secondary"
            className="flex-1"
            size="sm"
            leftIcon={<Ionicons name="pie-chart" size={16} color="#2563EB" />}
            onPress={() => router.push("/(tabs)/analysis")}
          />
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <AppText variant="h3" weight="bold">
              Dompet Saya
            </AppText>
            <AppButton
              title="+ Tambah"
              variant="ghost"
              size="sm"
              onPress={() => {
                router.push("/(modals)/add-wallet");
              }}
            />
          </View>

          {isLoading ? (
            <View>
              <WalletCardSkeleton />
              <WalletCardSkeleton />
            </View>
          ) : wallets.length > 0 ? (
            wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onPress={(w) =>
                  router.push({
                    pathname: "/(sub)/wallet-detail",
                    params: { data: JSON.stringify(w) },
                  })
                }
              />
            ))
          ) : (
            <AppCard
              variant="outlined"
              className="items-center py-8 border-dashed"
            >
              <Ionicons name="wallet-outline" size={32} color="#9CA3AF" />
              <AppText color="secondary" className="mt-2">
                Belum ada dompet
              </AppText>
              <AppButton
                title="Buat Dompet Pertama"
                variant="outline"
                size="sm"
                className="mt-4"
                onPress={() => router.push("/(modals)/add-wallet")}
              />
            </AppCard>
          )}
        </View>

        <View className="mb-24">
          <View className="flex-row justify-between items-center mb-4">
            <AppText variant="h3" weight="bold">
              Transaksi Terakhir
            </AppText>
            <AppText
              variant="label"
              color="primary"
              onPress={() => router.push("/(tabs)/history")}
            >
              Lihat Semua
            </AppText>
          </View>

          <AppCard variant="flat" className="p-6 items-center">
            <AppText color="secondary" variant="caption">
              Data transaksi akan muncul di sini
            </AppText>
          </AppCard>
        </View>
      </ScrollView>

      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowInfo(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center p-6">
            <TouchableWithoutFeedback>
              <View className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
                <View className="flex-row items-center gap-2 mb-3">
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  <AppText variant="h3" weight="bold">
                    Apa itu Safe-to-Spend?
                  </AppText>
                </View>

                <AppText className="text-gray-600 leading-6 mb-4">
                  Ini adalah <AppText weight="bold">batas maksimal</AppText>{" "}
                  uang yang boleh kamu keluarkan hari ini agar gajimu cukup
                  sampai akhir bulan.
                </AppText>

                <View className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100">
                  <AppText
                    variant="caption"
                    className="text-blue-800 font-medium text-center"
                  >
                    Rumus: (Total Saldo) ÷ (Sisa Hari)
                  </AppText>
                </View>

                <AppText
                  variant="caption"
                  color="secondary"
                  className="italic mb-6"
                >
                  Tips: Jika kamu belanja di bawah angka ini, sisa jatahnya akan
                  ditabung untuk besok!
                </AppText>

                <TouchableOpacity
                  onPress={() => setShowInfo(false)}
                  className="bg-gray-900 py-3 rounded-xl items-center"
                >
                  <AppText color="white" weight="bold">
                    Saya Mengerti
                  </AppText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
