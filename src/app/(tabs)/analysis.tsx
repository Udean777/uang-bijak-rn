import { AppCard } from "@/src/components/atoms/AppCard";
import { AppText } from "@/src/components/atoms/AppText";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useFinancialHealth } from "@/src/features/budgeting/hooks/useFinancialHealth";
import React from "react";
import { ScrollView, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export default function AnalysisScreen() {
  const { chartData, barData, summary, isLoading } = useFinancialHealth();

  const LegendItem = ({ color, label, value, subLabel }: any) => (
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center gap-3">
        <View
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <View>
          <AppText variant="body" weight="medium">
            {label}
          </AppText>
          <AppText variant="caption" color="secondary">
            {subLabel}
          </AppText>
        </View>
      </View>
      <AppText variant="body" weight="bold">
        {formatRupiah(value)}
      </AppText>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 ">
      <ScreenLoader visible={isLoading} text="Menganalisa..." />

      <View className="px-5 mb-6">
        <AppText variant="h2" weight="bold">
          Kesehatan Finansial
        </AppText>
        <AppText variant="body" color="secondary">
          Laporan arus kas & analisa bulan ini
        </AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5 mb-8">
          <AppText variant="h3" weight="bold" className="mb-4">
            Arus Kas Bulan Ini
          </AppText>
          <View className="bg-white p-5 rounded-3xl shadow-sm items-center justify-center min-h-[220px]">
            {barData && barData.length > 0 ? (
              <BarChart
                data={barData}
                barWidth={60}
                noOfSections={4}
                barBorderRadius={8}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                width={250}
                height={150}
                isAnimated
                xAxisLabelTextStyle={{
                  color: "gray",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              />
            ) : (
              <View className="items-center justify-center py-6">
                <AppText color="secondary">Belum ada data transaksi.</AppText>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 mb-6">
          <AppText variant="h3" weight="bold" className="mb-4">
            Analisa Pengeluaran
          </AppText>

          <View className="items-center justify-center bg-white p-6 rounded-3xl shadow-sm mb-6">
            {chartData.length > 0 ? (
              <PieChart
                data={chartData}
                donut
                radius={120}
                innerRadius={80}
                showText
                textColor="white"
                textSize={14}
                fontWeight="bold"
                centerLabelComponent={() => (
                  <View className="items-center">
                    <AppText variant="caption" color="secondary">
                      Total Pemasukan
                    </AppText>
                    <AppText variant="h3" weight="bold">
                      {formatRupiah(summary.income)}
                    </AppText>
                  </View>
                )}
              />
            ) : (
              <View className="h-40 items-center justify-center">
                <AppText color="secondary">
                  Belum ada pengeluaran tercatat.
                </AppText>
              </View>
            )}
          </View>

          <AppCard className="mb-6">
            <LegendItem
              color="#3B82F6"
              label="Needs (Kebutuhan)"
              subLabel="Target Ideal: 50%"
              value={summary.needs}
            />
            <View className="h-[1px] bg-gray-100 my-2" />
            <LegendItem
              color="#EF4444"
              label="Wants (Keinginan)"
              subLabel="Target Ideal: 30%"
              value={summary.wants}
            />
            <View className="h-[1px] bg-gray-100 my-2" />
            <LegendItem
              color="#10B981"
              label="Savings (Tabungan)"
              subLabel="Target Ideal: 20%"
              value={summary.savings > 0 ? summary.savings : 0}
            />
          </AppCard>

          <View className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <AppText
              variant="body"
              weight="bold"
              className="text-blue-800 mb-2"
            >
              💡 Insight Uang Bijak
            </AppText>
            <AppText variant="body" className="text-blue-700 leading-6">
              {summary.savings < 0
                ? "Peringatan: Pengeluaranmu lebih besar dari pemasukan (Defisit). Segera kurangi pengeluaran 'Wants'!"
                : summary.wants > summary.income * 0.3
                  ? "Hati-hati, porsi 'Keinginan' kamu sudah melebihi 30%. Coba tunda belanja hobi bulan depan."
                  : "Luar biasa! Kondisi keuanganmu sehat. Pertahankan porsi tabungan di atas 20%."}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
