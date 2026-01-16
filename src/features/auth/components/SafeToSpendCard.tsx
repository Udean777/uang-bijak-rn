import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { formatRupiah } from "@/src/utils";
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const statusColors = {
    safe: "bg-green-600",
    warning: "bg-yellow-500",
    danger: "bg-red-600",
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
        className={`${statusColors[status]} p-5 rounded-3xl shadow-lg`}
        style={{ shadowOpacity: isDark ? 0.3 : 0.1, shadowColor: "#000" }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <TouchableOpacity
              onPress={() => setShowInfo(true)}
              className="flex-row items-center gap-1 mb-1"
            >
              <AppText variant="label" color="white" style={{ opacity: 0.8 }}>
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
            <AppText variant="caption" color="white" style={{ opacity: 0.7 }}>
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
              <View
                className="p-6 rounded-3xl w-full max-w-sm"
                style={{ backgroundColor: theme.background }}
              >
                <View className="flex-row items-center gap-2 mb-3">
                  <Ionicons
                    name="sparkles"
                    size={24}
                    color={isDark ? theme.warning : "#F59E0B"}
                  />
                  <AppText variant="h3" weight="bold">
                    Apa itu Safe-to-Spend?
                  </AppText>
                </View>

                <AppText color="secondary" className="leading-6 mb-4">
                  Ini adalah <AppText weight="bold">batas maksimal</AppText>{" "}
                  uang yang boleh kamu habiskan hari ini agar uangmu cukup
                  sampai akhir bulan.
                </AppText>

                <View
                  className="p-3 rounded-xl mb-4"
                  style={{ backgroundColor: theme.surface }}
                >
                  <AppText
                    variant="caption"
                    className="font-mono text-center"
                    color="secondary"
                  >
                    (Total Saldo - Tagihan) ÷ Sisa Hari
                  </AppText>
                </View>

                <TouchableOpacity
                  onPress={() => setShowInfo(false)}
                  className="py-3 rounded-xl items-center"
                  style={{ backgroundColor: theme.primary }}
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
