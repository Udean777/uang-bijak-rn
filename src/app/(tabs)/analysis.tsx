import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

const CHART_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
];

export default function AnalysisScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    const unsub = TransactionService.subscribeTransactions(user.uid, (data) => {
      setTransactions(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const monthlyData = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth.getMonth() &&
        tDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  }, [transactions, currentMonth]);

  const { totalIncome, totalExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    monthlyData.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
    });
    return { totalIncome: inc, totalExpense: exp };
  }, [monthlyData]);

  const pieData = useMemo(() => {
    const expenses = monthlyData.filter((t) => t.type === "expense");
    const grouped: Record<string, number> = {};

    expenses.forEach((t) => {
      if (!grouped[t.category]) grouped[t.category] = 0;
      grouped[t.category] += t.amount;
    });

    const result = Object.keys(grouped).map((cat, index) => ({
      value: grouped[cat],
      color: CHART_COLORS[index % CHART_COLORS.length],
      text: cat,
      label: cat,
    }));

    return result.sort((a, b) => b.value - a.value);
  }, [monthlyData]);

  const renderLegendComponent = () => {
    return (
      <View className="mt-8 gap-y-4">
        {pieData.map((item, index) => (
          <View key={index} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                }}
              />
              <AppText className="text-gray-700" style={{ color: theme.text }}>
                {item.label}
              </AppText>
            </View>
            <View className="items-end">
              <AppText weight="bold">{formatRupiah(item.value)}</AppText>
              <AppText variant="caption" color="secondary">
                {((item.value / totalExpense) * 100).toFixed(1)}%
              </AppText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) return <ScreenLoader visible={true} text="Menganalisa..." />;

  const changeMonth = (direction: -1 | 1) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

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
          <AppText weight="bold">
            {currentMonth.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </AppText>
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
              {/* Text Tengah Donut */}
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
            <View className="w-full mb-10">{renderLegendComponent()}</View>
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
