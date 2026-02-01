import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { EditTransactionSheet } from "@/src/features/transactions/components/EditTransactionSheet";
import { useTransactionDetail } from "@/src/features/transactions/hooks/useTransactionDetail";
import { useTheme } from "@/src/hooks/useTheme";
import { formatDate, formatRupiah, formatTime } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function TransactionDetailScreen() {
  const { colors, isDark } = useTheme();

  const {
    transaction,
    walletName,
    isLoading,
    showDeleteDialog,
    setShowDeleteDialog,
    showEditSheet,
    setShowEditSheet,
    handleDelete,
    handleBack,
  } = useTransactionDetail();

  if (!transaction)
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }} />
    );

  const isExpense = transaction.type === "expense";

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenLoader visible={isLoading} text="Menghapus..." />

      <View className="px-5 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={handleBack}
          className="p-2 rounded-full shadow-sm"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <AppText weight="bold" variant="h3">
          Detail Transaksi
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1 px-5 pt-2">
        <View
          className="rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >
          <View
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-50"
            style={{ backgroundColor: colors.border }}
          />

          <View className="items-center mb-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{
                backgroundColor: isExpense
                  ? isDark
                    ? "rgba(239, 68, 68, 0.1)"
                    : "#FEF2F2"
                  : isDark
                    ? "rgba(34, 197, 94, 0.1)"
                    : "#F0FDF4",
              }}
            >
              <Ionicons
                name={
                  transaction.category === "Makan" ? "fast-food" : "pricetag"
                }
                size={32}
                color={isExpense ? colors.danger : colors.success}
              />
            </View>
            <AppText variant="h3" weight="bold">
              {transaction.category}
            </AppText>
            <AppText variant="caption">
              {formatDate(transaction.date)} • {formatTime(transaction.date)}
            </AppText>
          </View>

          <View
            className="h-[1px] w-full border-t border-dashed my-4"
            style={{ borderColor: colors.border }}
          />

          <View className="items-center mb-6">
            <AppText
              variant="caption"
              className="uppercase tracking-widest mb-1"
            >
              Total Transaksi
            </AppText>
            <AppText
              variant="h1"
              weight="bold"
              style={{ color: isExpense ? colors.danger : colors.success }}
            >
              {isExpense ? "-" : "+"}
              {formatRupiah(transaction.amount)}
            </AppText>
            {transaction.classification && (
              <View
                className="mt-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor:
                    transaction.classification === "need"
                      ? isDark
                        ? "rgba(37, 99, 235, 0.1)"
                        : "#EFF6FF"
                      : isDark
                        ? "rgba(147, 51, 234, 0.1)"
                        : "#FAF5FF",
                }}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={{
                    color:
                      transaction.classification === "need"
                        ? "#3B82F6"
                        : "#A855F7",
                  }}
                >
                  {transaction.classification === "need"
                    ? "NEEDS (Kebutuhan)"
                    : "WANTS (Keinginan)"}
                </AppText>
              </View>
            )}
          </View>

          <View
            className="rounded-xl p-4 gap-y-3"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row justify-between">
              <AppText>Sumber Dana</AppText>
              <View className="flex-row items-center gap-1">
                <Ionicons name="wallet-outline" size={14} color={colors.text} />
                <AppText weight="bold">{walletName}</AppText>
              </View>
            </View>
            <View className="flex-row justify-between">
              <AppText>Tipe</AppText>
              <AppText
                weight="bold"
                style={{ color: isExpense ? colors.danger : colors.success }}
              >
                {isExpense ? "Pengeluaran" : "Pemasukan"}
              </AppText>
            </View>
            <View className="flex-row justify-between items-start">
              <AppText>Catatan</AppText>
              <AppText weight="medium" className="text-right flex-1 ml-4">
                {transaction.note || "-"}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="p-5 border-t flex-row gap-3"
        style={{
          borderTopColor: colors.divider,
          backgroundColor: colors.surface,
        }}
      >
        <AppButton
          title="Edit"
          variant="outline"
          className="flex-1"
          onPress={() => setShowEditSheet(true)}
          leftIcon={
            <Ionicons name="create-outline" size={20} color={colors.text} />
          }
        />
        <AppButton
          title="Hapus"
          variant="danger"
          className="flex-1"
          onPress={() => setShowDeleteDialog(true)}
          leftIcon={<Ionicons name="trash-outline" size={20} color="#ffffff" />}
        />
      </View>

      <EditTransactionSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        transaction={transaction}
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Hapus Transaksi?"
        message="Saldo di dompet Anda akan dikembalikan seperti sebelum transaksi ini terjadi."
        confirmText="Hapus"
        variant="danger"
        isLoading={isLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}
