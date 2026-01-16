import { Colors } from "@/constants/theme";
import { useThemeControl } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { SafeToSpendCard } from "@/src/features/auth/components/SafeToSpendCard";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionHistorySheet } from "@/src/features/transactions/components/TransactionHistorySheet";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { WalletCard } from "@/src/features/wallets/components/WalletCard";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { BudgetService } from "@/src/services/budgetService";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { wallets, isLoading: walletsLoading } = useWallets();

  const { colorScheme, toggleColorScheme } = useThemeControl();
  const isDark = colorScheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  const [safeDaily, setSafeDaily] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState<
    "safe" | "warning" | "danger"
  >("safe");
  const [remainingDays, setRemainingDays] = useState(0);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [showHistorySheet, setShowHistorySheet] = useState(false);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  useEffect(() => {
    if (!user) return;
    const fetchBudget = async () => {
      const now = new Date();
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      const today = now.getDate();
      const left = daysInMonth - today + 1;
      setRemainingDays(left);

      const needs = await BudgetService.calculateMonthlyNeeds(user.uid);
      const disposable = totalBalance - needs;
      const safe = disposable > 0 ? disposable / left : 0;

      setSafeDaily(safe);
      if (safe < 50000) setBudgetStatus("danger");
      else if (safe < 100000) setBudgetStatus("warning");
      else setBudgetStatus("safe");
      setBudgetLoading(false);
    };
    fetchBudget();
  }, [user, totalBalance]);

  useEffect(() => {
    if (!user) return;
    const unsub = TransactionService.subscribeTransactions(user.uid, (data) => {
      const sorted = data.sort((a, b) => b.date - a.date);
      setAllTransactions(sorted);
      setRecentTransactions(sorted.slice(0, 5));
      setLoadingTransactions(false);
    });
    return () => unsub();
  }, [user]);

  const handleTransactionPress = (item: Transaction) => {
    router.push({
      pathname: "/(modals)/transaction-detail",
      params: { data: JSON.stringify(item) },
    });
  };

  if (walletsLoading) {
    return (
      <View
        style={{ flex: 1, backgroundColor: theme.background }}
        className="justify-center items-center p-5"
      >
        <Skeleton variant="circle" width={80} height={80} className="mb-4" />
        <Skeleton variant="box" width="60%" height={20} className="mb-2" />
        <Skeleton variant="box" width="40%" height={20} />
      </View>
    );
  }

  if (wallets.length === 0) {
    return (
      <View
        style={{ flex: 1, backgroundColor: theme.background }}
        className="px-5"
      >
        <View className="flex-row items-center gap-3 mb-10">
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
            <AppText weight="bold" color="primary">
              {userProfile?.displayName?.charAt(0) || "U"}
            </AppText>
          </View>
          <View>
            <AppText color="secondary">Halo,</AppText>
            <AppText weight="bold" variant="h3">
              {userProfile?.displayName || "Pengguna Baru"}
            </AppText>
          </View>
        </View>

        <View className="flex-1 justify-center -mt-20">
          <EmptyState
            title="Mulai Perjalanan Keuanganmu"
            message="Kamu belum memiliki dompet. Yuk, buat dompet pertamamu untuk mulai mencatat pemasukan dan pengeluaran!"
            icon="wallet"
            actionLabel="Buat Dompet Sekarang"
            onAction={() => router.push("/(modals)/add-wallet")}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={walletsLoading}
            onRefresh={() => {}}
            tintColor={theme.primary}
          />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <AppText color="default">Selamat Pagi,</AppText>
            <AppText variant="h2" weight="bold">
              {userProfile?.displayName || "Pengguna"}
            </AppText>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={toggleColorScheme}
              className="w-10 h-10 rounded-full items-center justify-center border"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={20}
                color={theme.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/menu")}
              className="w-10 h-10 rounded-full items-center justify-center border shadow-sm"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowOpacity: isDark ? 0.3 : 0.1,
              }}
            >
              <AppText weight="bold">
                {userProfile?.displayName?.charAt(0) || "U"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <SafeToSpendCard
            isLoading={budgetLoading}
            status={budgetStatus}
            safeDaily={safeDaily}
            totalBalance={totalBalance}
            remainingDays={remainingDays}
          />
        </View>

        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <AppText variant="h3" weight="bold">
              Dompet Saya
            </AppText>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/add-wallet")}
            >
              <AppText weight="bold">+ Tambah</AppText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5 px-5"
          >
            {wallets.map((wallet) => (
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
            ))}
          </ScrollView>
        </View>

        <View className="mb-32">
          <View className="flex-row justify-between items-center mb-4">
            <AppText variant="h3" weight="bold">
              Transaksi Terakhir
            </AppText>
            <AppText weight="bold" onPress={() => setShowHistorySheet(true)}>
              Lihat Semua
            </AppText>
          </View>

          {loadingTransactions ? (
            <View className="gap-y-3">
              <Skeleton
                variant="box"
                width="100%"
                height={70}
                className="rounded-xl"
              />
              <Skeleton
                variant="box"
                width="100%"
                height={70}
                className="rounded-xl"
              />
            </View>
          ) : recentTransactions.length === 0 ? (
            <View
              className="py-6 border border-dashed rounded-2xl"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <EmptyState
                icon="receipt-outline"
                title="Belum ada transaksi"
                message="Mulai catat pengeluaranmu sekarang."
              />
            </View>
          ) : (
            <View className="gap-y-3">
              {recentTransactions.map((t) => (
                <View
                  key={t.id}
                  className="rounded-xl overflow-hidden border shadow-sm"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    shadowOpacity: isDark ? 0.3 : 0.1,
                  }}
                >
                  <TransactionItem
                    transaction={t}
                    onPress={handleTransactionPress}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TransactionHistorySheet
        visible={showHistorySheet}
        onClose={() => setShowHistorySheet(false)}
        transactions={allTransactions}
        loading={loadingTransactions}
        onTransactionPress={handleTransactionPress}
      />
    </View>
  );
}
