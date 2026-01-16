import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface SafeToSpendProps {
  isLoading: boolean;
  status: "safe" | "warning" | "danger";
  safeDaily: number;
  totalBalance: number;
  remainingDays: number;
}

export const SafeToSpendCard = ({
  isLoading,
  status,
  safeDaily,
  totalBalance,
  remainingDays,
}: SafeToSpendProps) => {
  const [showInfo, setShowInfo] = useState(false);

  const statusColors = {
    safe: "bg-green-600",
    warning: "bg-yellow-500",
    danger: "bg-red-600",
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.floor(value));
  };

  if (isLoading) {
    return (
      <Skeleton
        variant="box"
        width="100%"
        height={150}
        className="rounded-2xl"
      />
    );
  }

  return (
    <>
      <View
        className={`${statusColors[status]} p-5 rounded-3xl shadow-lg shadow-gray-300`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <TouchableOpacity
              onPress={() => setShowInfo(true)}
              className="flex-row items-center gap-1 mb-1"
            >
              <AppText variant="label" className="text-white/80">
                Safe-to-Spend (Harian)
              </AppText>
              <Ionicons
                name="help-circle-outline"
                size={16}
                color="white"
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>

            <AppText
              variant="h1"
              weight="bold"
              color="white"
              className="text-4xl"
            >
              {formatRupiah(safeDaily)}
            </AppText>
          </View>

          <View className="bg-white/20 px-3 py-1 rounded-full border border-white/10">
            <AppText variant="caption" weight="bold" color="white">
              {remainingDays} Hari Lagi
            </AppText>
          </View>
        </View>

        <View className="h-[1px] bg-white/20 w-full my-3" />

        <View className="flex-row justify-between items-center">
          <View>
            <AppText variant="caption" className="text-white/70">
              Total Saldo Aktif
            </AppText>
            <AppText variant="body" weight="bold" color="white">
              {formatRupiah(totalBalance)}
            </AppText>
          </View>
          <Ionicons
            name={
              status === "safe"
                ? "shield-checkmark"
                : status === "warning"
                  ? "alert"
                  : "warning"
            }
            size={28}
            color="white"
            style={{ opacity: 0.8 }}
          />
        </View>
      </View>

      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowInfo(false)}>
          <View className="flex-1 bg-black/60 justify-center items-center p-6">
            <TouchableWithoutFeedback>
              <View className="bg-white p-6 rounded-3xl w-full max-w-sm">
                <View className="flex-row items-center gap-2 mb-3">
                  <Ionicons name="sparkles" size={24} color="#F59E0B" />
                  <AppText variant="h3" weight="bold">
                    Apa itu Safe-to-Spend?
                  </AppText>
                </View>

                <AppText className="text-gray-600 leading-6 mb-4">
                  Ini adalah <AppText weight="bold">batas maksimal</AppText>{" "}
                  uang yang boleh kamu habiskan hari ini agar uangmu cukup
                  sampai akhir bulan.
                </AppText>

                <View className="bg-gray-100 p-3 rounded-xl mb-4">
                  <AppText
                    variant="caption"
                    className="text-gray-800 font-mono text-center"
                  >
                    (Total Saldo - Tagihan) ÷ Sisa Hari
                  </AppText>
                </View>

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
    </>
  );
};
