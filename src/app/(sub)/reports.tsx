import { AppText } from "@/src/components/atoms/AppText";
import { useReportsScreen } from "@/src/features/reports/hooks/useReportsScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function ReportsScreen() {
  const { colors: theme, isDark } = useTheme();

  const {
    selectedMonth,
    selectedYear,
    transactions,
    isLoading,
    isExporting,
    totalIncome,
    totalExpense,
    needsTotal,
    wantsTotal,
    categoryData,
    pieData,
    goToPreviousMonth,
    goToNextMonth,
    handleExport,
    isCurrentMonth,
    handleBack,
  } = useReportsScreen();

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">
          Laporan Bulanan
        </AppText>
        <TouchableOpacity
          onPress={handleExport}
          disabled={isExporting}
          className="p-2 -mr-2"
        >
          <Ionicons
            name="share-outline"
            size={24}
            color={isExporting ? theme.icon : theme.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Month Selector */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={goToPreviousMonth} className="p-2">
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <AppText variant="h2" weight="bold">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </AppText>
          <TouchableOpacity
            onPress={goToNextMonth}
            className="p-2"
            disabled={isCurrentMonth}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isCurrentMonth ? theme.icon : theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 p-4 rounded-2xl"
            style={{
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
            }}
          >
            <AppText
              variant="caption"
              weight="bold"
              style={{ color: "#10B981" }}
            >
              PEMASUKAN
            </AppText>
            <AppText variant="h3" weight="bold" style={{ color: "#10B981" }}>
              {formatCurrency(totalIncome)}
            </AppText>
          </View>
          <View
            className="flex-1 p-4 rounded-2xl"
            style={{
              backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2",
            }}
          >
            <AppText
              variant="caption"
              weight="bold"
              style={{ color: "#EF4444" }}
            >
              PENGELUARAN
            </AppText>
            <AppText variant="h3" weight="bold" style={{ color: "#EF4444" }}>
              {formatCurrency(totalExpense)}
            </AppText>
          </View>
        </View>

        {/* Balance */}
        <View
          className="p-4 rounded-2xl mb-6"
          style={{ backgroundColor: theme.surface }}
        >
          <AppText variant="caption" weight="bold" className="mb-1">
            SELISIH
          </AppText>
          <AppText
            variant="h2"
            weight="bold"
            style={{
              color: totalIncome - totalExpense >= 0 ? "#10B981" : "#EF4444",
            }}
          >
            {totalIncome - totalExpense >= 0 ? "+" : ""}
            {formatCurrency(totalIncome - totalExpense)}
          </AppText>
        </View>

        {/* Needs vs Wants */}
        <View className="mb-6">
          <AppText variant="h3" weight="bold" className="mb-3">
            Klasifikasi Pengeluaran
          </AppText>
          <View className="flex-row gap-3">
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{
                borderColor: "#3B82F6",
                backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
              }}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={{ color: "#3B82F6" }}
              >
                KEBUTUHAN
              </AppText>
              <AppText weight="bold" style={{ color: "#3B82F6" }}>
                {formatCurrency(needsTotal)}
              </AppText>
              <AppText variant="caption" style={{ color: "#3B82F6" }}>
                {totalExpense > 0
                  ? Math.round((needsTotal / totalExpense) * 100)
                  : 0}
                %
              </AppText>
            </View>
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{
                borderColor: "#A855F7",
                backgroundColor: isDark ? "rgba(168, 85, 247, 0.1)" : "#FAF5FF",
              }}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={{ color: "#A855F7" }}
              >
                KEINGINAN
              </AppText>
              <AppText weight="bold" style={{ color: "#A855F7" }}>
                {formatCurrency(wantsTotal)}
              </AppText>
              <AppText variant="caption" style={{ color: "#A855F7" }}>
                {totalExpense > 0
                  ? Math.round((wantsTotal / totalExpense) * 100)
                  : 0}
                %
              </AppText>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <View className="mb-8">
            <AppText variant="h3" weight="bold" className="mb-4">
              Pengeluaran per Kategori
            </AppText>

            {/* Pie Chart */}
            <View className="items-center mb-4">
              <PieChart
                data={pieData}
                donut
                radius={80}
                innerRadius={50}
                innerCircleColor={theme.background}
                centerLabelComponent={() => (
                  <View className="items-center">
                    <AppText variant="caption">Total</AppText>
                    <AppText weight="bold" variant="body">
                      {formatCurrency(totalExpense)}
                    </AppText>
                  </View>
                )}
              />
            </View>

            {/* Legend */}
            {categoryData.map((item, index) => (
              <View
                key={item.category}
                className="flex-row items-center justify-between py-3 border-b"
                style={{ borderBottomColor: theme.divider }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <AppText>{item.category}</AppText>
                </View>
                <View className="items-end">
                  <AppText weight="bold">{formatCurrency(item.amount)}</AppText>
                  <AppText variant="caption">
                    {Math.round((item.amount / totalExpense) * 100)}%
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {transactions.length === 0 && !isLoading && (
          <View className="items-center py-10">
            <Ionicons
              name="document-text-outline"
              size={48}
              color={theme.icon}
            />
            <AppText className="mt-4 text-center">
              Belum ada transaksi di bulan ini.
            </AppText>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
