import { AppCard } from "@/src/components/atoms/AppCard";
import { AppText } from "@/src/components/atoms/AppText";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useFinancialHealth } from "@/src/features/budgeting/hooks/useFinancialHealth";
import React from "react";
import { ScrollView, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export default function AnalysisScreen() {
  const { chartData, summary, isLoading } = useFinancialHealth();

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
    <View className="flex-1 bg-gray-50">
      <ScreenLoader visible={isLoading} text="Menganalisa..." />

      <View className="px-5 mb-6">
        <AppText variant="h2" weight="bold">
          Kesehatan Finansial
        </AppText>
        <AppText variant="body" color="secondary">
          Analisa bulan ini
        </AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="items-center justify-center bg-white mx-5 p-6 rounded-3xl shadow-sm mb-6">
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
                    Total Income
                  </AppText>
                  <AppText variant="h3" weight="bold">
                    {formatRupiah(summary.income)}
                  </AppText>
                </View>
              )}
            />
          ) : (
            <View className="h-60 items-center justify-center">
              <AppText color="secondary">
                Belum ada data pemasukan bulan ini.
              </AppText>
            </View>
          )}
        </View>

        <View className="px-5">
          <AppText variant="h3" weight="bold" className="mb-4">
            Rincian Pengeluaran
          </AppText>

          <AppCard className="mb-6">
            <LegendItem
              color="#3B82F6"
              label="Needs (Kebutuhan)"
              subLabel="Target: 50%"
              value={summary.needs}
            />
            <View className="h-[1px] bg-gray-100 my-2" />
            <LegendItem
              color="#EF4444"
              label="Wants (Keinginan)"
              subLabel="Target: 30%"
              value={summary.wants}
            />
            <View className="h-[1px] bg-gray-100 my-2" />
            <LegendItem
              color="#10B981"
              label="Savings (Tabungan)"
              subLabel="Target: 20%"
              value={summary.savings > 0 ? summary.savings : 0}
            />
          </AppCard>

          <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <AppText
              variant="body"
              weight="bold"
              className="text-blue-800 mb-1"
            >
              💡 Insight Uang Bijak
            </AppText>
            <AppText variant="caption" className="text-blue-700 leading-5">
              {summary.savings < 0
                ? "Waduh! Pengeluaranmu lebih besar dari pemasukan bulan ini. Kurangi 'Wants' segera!"
                : summary.wants > summary.income * 0.3
                  ? "Hati-hati, porsi 'Keinginan' kamu sudah melebihi 30%. Coba tunda belanja hobi dulu."
                  : "Mantap! Porsi keuanganmu terlihat sehat. Pertahankan tabungan di atas 20%."}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
