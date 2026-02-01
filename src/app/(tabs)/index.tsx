import { useThemeControl } from "@/hooks/use-color-scheme";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { SafeToSpendCard } from "@/src/features/auth/components/SafeToSpendCard";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { HomeHeader } from "@/src/features/home/components/HomeHeader";
import { InsightSection } from "@/src/features/home/components/InsightSection";
import { QuickAccessSection } from "@/src/features/home/components/QuickAccessSection";
import { RecentTransactionsSection } from "@/src/features/home/components/RecentTransactionsSection";
import { WalletSection } from "@/src/features/home/components/WalletSection";
import { useHomeData } from "@/src/features/home/hooks/useHomeData";
import { TransactionHistorySheet } from "@/src/features/transactions/components/TransactionHistorySheet";
import { useTheme } from "@/src/hooks/useTheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { toggleColorScheme } = useThemeControl();
  const { colors } = useTheme();

  const {
    wallets,
    walletsLoading,
    insights,
    totalBalance,
    safeDaily,
    budgetStatus,
    remainingDays,
    budgetLoading,
    allTransactions,
    recentTransactions,
    loadingTransactions,
    templates,
    templateToConfirm,
    isConfirmVisible,
    setConfirmVisible,
    confirmLoading,
    handleUseTemplate,
    handleConfirmTemplate,
  } = useHomeData();

  const [showHistorySheet, setShowHistorySheet] = useState(false);

  if (walletsLoading) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background }}
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
        style={{ flex: 1, backgroundColor: colors.background }}
        className="px-5"
      >
        <HomeHeader
          displayName={userProfile?.displayName || "Pengguna Baru"}
          toggleColorScheme={toggleColorScheme}
          onMenuPress={() => router.push("/(tabs)/menu")}
        />
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={walletsLoading}
            onRefresh={() => {}}
            tintColor={colors.primary}
          />
        }
      >
        <HomeHeader
          displayName={userProfile?.displayName || "Pengguna"}
          toggleColorScheme={toggleColorScheme}
          onMenuPress={() => router.push("/(tabs)/menu")}
        />

        <View className="mb-8">
          <SafeToSpendCard
            isLoading={budgetLoading}
            status={budgetStatus}
            safeDaily={safeDaily}
            totalBalance={totalBalance}
            remainingDays={remainingDays}
          />
        </View>

        <WalletSection
          wallets={wallets}
          onAddPress={() => router.push("/(modals)/add-wallet")}
          onWalletPress={(w) =>
            router.push({
              pathname: "/(sub)/wallet-detail",
              params: { data: JSON.stringify(w) },
            })
          }
        />

        <QuickAccessSection
          templates={templates}
          onUseTemplate={handleUseTemplate}
          onManagePress={() => router.push("/(sub)/manage-templates")}
        />

        <InsightSection insights={insights} />

        <RecentTransactionsSection
          transactions={recentTransactions}
          isLoading={loadingTransactions}
          onSeeAllPress={() => setShowHistorySheet(true)}
          onTransactionPress={(item) =>
            router.push({
              pathname: "/(modals)/transaction-detail",
              params: { data: JSON.stringify(item) },
            })
          }
        />
      </ScrollView>

      <TransactionHistorySheet
        visible={showHistorySheet}
        onClose={() => setShowHistorySheet(false)}
        transactions={allTransactions}
        loading={loadingTransactions}
        onTransactionPress={(item) =>
          router.push({
            pathname: "/(modals)/transaction-detail",
            params: { data: JSON.stringify(item) },
          })
        }
      />

      <ConfirmDialog
        visible={isConfirmVisible}
        title="Input Cepat ⚡"
        message={
          templateToConfirm
            ? `Catat ${templateToConfirm.template.name} (${templateToConfirm.template.amount.toLocaleString()}) dari ${templateToConfirm.walletName}?`
            : ""
        }
        onConfirm={handleConfirmTemplate}
        onCancel={() => setConfirmVisible(false)}
        confirmText="Ya, Catat"
        cancelText="Batal"
        isLoading={confirmLoading}
      />
    </View>
  );
}
