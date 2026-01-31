import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { db } from "@/src/config/firebase";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { ExportService } from "@/src/services/ExportService";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Toast from "react-native-toast-message";

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

interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export default function ReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Subscribe to transactions
  useEffect(() => {
    if (!user) return;

    const startDate = new Date(selectedYear, selectedMonth, 1).getTime();
    const endDate = new Date(
      selectedYear,
      selectedMonth + 1,
      0,
      23,
      59,
      59,
      999,
    ).getTime();

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Transaction)
          .filter((t) => t.date >= startDate && t.date <= endDate);
        setTransactions(txs);
        setIsLoading(false);
      },
      (error) => {
        console.error("[Reports] Snapshot error:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, selectedMonth, selectedYear]);

  // Calculate summary
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const needsTotal = transactions
    .filter((t) => t.type === "expense" && t.classification === "need")
    .reduce((sum, t) => sum + t.amount, 0);

  const wantsTotal = transactions
    .filter((t) => t.type === "expense" && t.classification === "want")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate category breakdown
  const categoryData: CategoryData[] = [];
  const categoryMap: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount], index) => {
      categoryData.push({
        category,
        amount,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      });
    });

  const pieData = categoryData.map((c) => ({
    value: c.amount,
    color: c.color,
    text: c.category,
  }));

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return; // Don't go beyond current month
    }

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleExport = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      await ExportService.exportMonthlySummaryToCSV(
        user.uid,
        selectedYear,
        selectedMonth + 1,
      );
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Export Gagal",
        text2: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const isCurrentMonth =
    selectedYear === new Date().getFullYear() &&
    selectedMonth === new Date().getMonth();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
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
