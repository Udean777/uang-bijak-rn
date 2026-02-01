import { AppText } from "@/src/components/atoms/AppText";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { LegendItem } from "@/src/features/analysis/components/LegendItem";
import {
  formatRupiah,
  useAnalysisScreen,
} from "@/src/features/analysis/hooks/useAnalysisScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function AnalysisScreen() {
  const { colors: theme, isDark } = useTheme();

  const {
    loading,
    currentMonth,
    formattedMonth,
    totalIncome,
    totalExpense,
    pieData,
    changeMonth,
  } = useAnalysisScreen();

  if (loading) return <ScreenLoader visible={true} text="Menganalisa..." />;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 flex-row justify-between items-center border-b"
        style={{ borderBottomColor: theme.border }}
      >
        <AppText variant="h2" weight="bold">
          Analisis
        </AppText>
        <View
          className="flex-row items-center gap-3 px-3 py-1 rounded-full border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <AppText weight="bold">{formattedMonth}</AppText>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <View className="flex-row gap-4 mb-8">
          <View
            className="flex-1 p-4 rounded-2xl border"
            style={{
              backgroundColor: isDark ? "rgba(22, 163, 74, 0.1)" : "#F0FDF4",
              borderColor: isDark ? "rgba(22, 163, 74, 0.3)" : "#DCFCE7",
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="arrow-down-circle" size={18} color="#16A34A" />
              <AppText className="text-green-700 text-xs font-bold uppercase">
                Pemasukan
              </AppText>
            </View>
            <AppText weight="bold" className="text-lg">
              {formatRupiah(totalIncome)}
            </AppText>
          </View>
          <View
            className="flex-1 p-4 rounded-2xl border"
            style={{
              backgroundColor: isDark ? "rgba(220, 38, 38, 0.1)" : "#FEF2F2",
              borderColor: isDark ? "rgba(220, 38, 38, 0.3)" : "#FEE2E2",
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="arrow-up-circle" size={18} color="#DC2626" />
              <AppText className="text-red-700 text-xs font-bold uppercase">
                Pengeluaran
              </AppText>
            </View>
            <AppText weight="bold" className="text-lg">
              {formatRupiah(totalExpense)}
            </AppText>
          </View>
        </View>

        {totalExpense > 0 ? (
          <View className="items-center">
            <View className="items-center justify-center">
              <View className="absolute z-10 items-center">
                <AppText variant="caption" color="secondary">
                  Total Keluar
                </AppText>
                <AppText variant="h3" weight="bold">
                  {formatRupiah(totalExpense)}
                </AppText>
              </View>

              <PieChart
                data={pieData}
                donut
                radius={120}
                innerRadius={85}
                innerCircleColor={theme.background}
                centerLabelComponent={() => <View />}
              />
            </View>
            <View className="w-full mb-10 mt-8 gap-y-4">
              {pieData.map((item, index) => (
                <LegendItem
                  key={index}
                  label={item.label}
                  color={item.color}
                  value={item.value}
                  totalExpense={totalExpense}
                />
              ))}
            </View>
          </View>
        ) : (
          <View className="mt-10">
            <EmptyState
              title="Belum Ada Data"
              message={`Belum ada pengeluaran tercatat di bulan ${currentMonth.toLocaleDateString("id-ID", { month: "long" })}.`}
              icon="pie-chart-outline"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
