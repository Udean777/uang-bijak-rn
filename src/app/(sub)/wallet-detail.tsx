import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { EditWalletSheet } from "@/src/features/wallets/components/EditWalletSheet";
import {
  formatRupiah,
  useWalletDetailScreen,
} from "@/src/features/wallets/hooks/useWalletDetailScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function WalletDetailScreen() {
  const { colors: theme } = useTheme();

  const {
    wallet,
    transactions,
    isLoading,
    showDeleteDialog,
    setShowDeleteDialog,
    showEditSheet,
    setShowEditSheet,
    handleBack,
    handleConfirmDelete,
    handleTransactionPress,
  } = useWalletDetailScreen();

  if (!wallet)
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenLoader visible={isLoading} text="Menghapus..." />

      <View
        className="px-5 pb-4 border-b flex-row items-center justify-between"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText weight="bold" variant="h3">
          Detail Dompet
        </AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1">
        <View
          className="m-5 p-6 rounded-2xl"
          style={{ backgroundColor: wallet.color }}
        >
          <View className="flex-row justify-between items-start mb-6">
            <View className="bg-white/20 p-3 rounded-xl">
              <Ionicons name="wallet" size={32} color="white" />
            </View>
            <AppText
              weight="bold"
              color="white"
              className="uppercase tracking-widest"
            >
              {wallet.type}
            </AppText>
          </View>

          <AppText color="white" weight="bold" className="mb-1">
            Saldo Saat Ini
          </AppText>
          <AppText color="white" weight="bold" variant="h1" className="mb-2">
            {formatRupiah(wallet.balance)}
          </AppText>
          <AppText color="white" weight="medium" variant="h3">
            {wallet.name}
          </AppText>
        </View>

        <View className="px-5 flex-row gap-3 mb-8">
          <AppButton
            title="Edit"
            variant="outline"
            className="flex-1"
            onPress={() => setShowEditSheet(true)}
            leftIcon={
              <Ionicons name="create-outline" size={18} color={theme.text} />
            }
          />
          <AppButton
            title="Hapus"
            variant="danger"
            className="flex-1"
            style={{
              backgroundColor: theme.danger,
              borderColor: theme.danger,
            }}
            onPress={() => setShowDeleteDialog(true)}
            leftIcon={<Ionicons name="trash-outline" size={18} color="white" />}
          />
        </View>

        <View className="px-5 pb-10">
          <AppText variant="h3" weight="bold" className="mb-4">
            Riwayat Transaksi
          </AppText>
          {transactions.length === 0 ? (
            <View
              className="py-10 rounded-2xl border border-dashed"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <EmptyState
                icon="receipt-outline"
                title="Belum ada transaksi"
                message="Dompet ini belum memiliki riwayat transaksi."
                className=""
              />
            </View>
          ) : (
            transactions.map((t) => (
              <View
                key={t.id}
                className="mb-3 rounded-xl overflow-hidden border"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                }}
              >
                <TransactionItem
                  transaction={t}
                  onPress={handleTransactionPress}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <EditWalletSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        wallet={wallet}
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Hapus Dompet?"
        message="Semua riwayat transaksi yang terhubung dengan dompet ini akan kehilangan referensinya. Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Permanen"
        cancelText="Batal"
        variant="danger"
        isLoading={isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}
