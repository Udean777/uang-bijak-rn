import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { useTheme } from "@/src/hooks/useTheme";
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
  const [infoType, setInfoType] = useState<
    "safeToSpend" | "balance" | "status" | null
  >(null);
  const { colors: theme, isDark } = useTheme();

  const statusColors = {
    safe: "bg-green-600",
    warning: "bg-yellow-500",
    danger: "bg-red-600",
  };

  const getModalContent = () => {
    switch (infoType) {
      case "safeToSpend":
        return {
          title: "Apa itu Safe-to-Spend?",
          description: (
            <AppText className="leading-6 mb-4">
              Ini adalah <AppText weight="bold">batas maksimal</AppText> uang
              yang boleh kamu habiskan hari ini agar uangmu cukup sampai akhir
              bulan.
            </AppText>
          ),
          formula: "(Total Saldo - Tagihan) ÷ Sisa Hari",
        };
      case "balance":
        return {
          title: "Total Saldo Aktif",
          description: (
            <AppText className="leading-6 mb-4">
              Total uang tunai dan saldo di rekening yang{" "}
              <AppText weight="bold">bisa kamu gunakan</AppText> saat ini. Sudah
              dikurangi tagihan bulanan.
            </AppText>
          ),
          formula: "∑ Saldo Dompet - ∑ Tagihan Unpaid",
        };
      case "status":
        const messages = {
          safe: "Keuanganmu aman! Pertahankan pengeluaranmu di bawah batas harian.",
          warning:
            "Hati-hati! Kamu mulai mendekati batas boros. Kurangi jajan ya!",
          danger:
            "Bahaya! Kamu sudah melebihi batas wajar. Stop pengeluaran tidak perlu!",
        };
        return {
          title: "Status Keuangan",
          description: (
            <AppText className="leading-6 mb-4">{messages[status]}</AppText>
          ),
          formula: null,
        };
      default:
        return null;
    }
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

  const modalContent = getModalContent();

  return (
    <>
      <View
        className={`${statusColors[status]} p-5 rounded-3xl shadow-lg`}
        style={{ shadowOpacity: isDark ? 0.3 : 0.1, shadowColor: "#000" }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <TouchableOpacity
              onPress={() => setInfoType("safeToSpend")}
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
          <TouchableOpacity onPress={() => setInfoType("balance")}>
            <View>
              <View className="flex-row items-center gap-1">
                <AppText
                  variant="caption"
                  color="white"
                  style={{ opacity: 0.7 }}
                >
                  Total Saldo Aktif
                </AppText>
                <Ionicons
                  name="help-circle-outline"
                  size={14}
                  color="white"
                  style={{ opacity: 0.7 }}
                />
              </View>
              <AppText variant="body" weight="bold" color="white">
                {formatRupiah(totalBalance)}
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setInfoType("status")}>
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
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={!!infoType}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoType(null)}
      >
        <TouchableWithoutFeedback onPress={() => setInfoType(null)}>
          <View className="flex-1 bg-black/60 justify-center items-center p-6">
            <TouchableWithoutFeedback>
              <View
                className="p-6 rounded-3xl w-full max-w-sm"
                style={{ backgroundColor: theme.background }}
              >
                {modalContent && (
                  <>
                    <View className="flex-row items-center gap-2 mb-3">
                      <Ionicons
                        name="sparkles"
                        size={24}
                        color={isDark ? theme.warning : "#F59E0B"}
                      />
                      <AppText variant="h3" weight="bold">
                        {modalContent.title}
                      </AppText>
                    </View>

                    {modalContent.description}

                    {modalContent.formula && (
                      <View
                        className="p-3 rounded-xl mb-4"
                        style={{
                          backgroundColor: isDark ? "#1E1E1E" : theme.surface,
                        }}
                      >
                        <AppText
                          variant="caption"
                          className="font-mono text-center"
                          style={{ color: isDark ? "white" : "black" }}
                        >
                          {modalContent.formula}
                        </AppText>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => setInfoType(null)}
                      className="py-3 rounded-xl items-center"
                      style={{
                        backgroundColor: isDark ? "#1E1E1E" : theme.primary,
                      }}
                    >
                      <AppText color="white" weight="bold">
                        Saya Mengerti
                      </AppText>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
