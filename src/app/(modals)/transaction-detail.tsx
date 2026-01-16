import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { db } from "@/src/config/firebase";
import { EditTransactionSheet } from "@/src/features/transactions/components/EditTransactionSheet";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { formatDate, formatRupiah, formatTime } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const initialTransaction = useMemo(() => {
    if (params.data && typeof params.data === "string") {
      try {
        return JSON.parse(params.data);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.data]);

  const [transaction, setTransaction] = useState<Transaction | null>(
    initialTransaction
  );
  const [walletName, setWalletName] = useState("Memuat...");

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  useEffect(() => {
    if (!initialTransaction?.id) return;
    const unsub = onSnapshot(
      doc(db, "transactions", initialTransaction.id),
      (doc) => {
        if (doc.exists()) {
          setTransaction({ id: doc.id, ...doc.data() } as Transaction);
        } else {
          setTransaction(null);
        }
      }
    );
    return () => unsub();
  }, [initialTransaction?.id]);

  useEffect(() => {
    if (transaction?.walletId) {
      const fetchWallet = async () => {
        const docRef = doc(db, "wallets", transaction.walletId);
        const snap = await getDoc(docRef);
        if (snap.exists()) setWalletName(snap.data().name);
        else setWalletName("Dompet Terhapus");
      };
      fetchWallet();
    }
  }, [transaction?.walletId]);

  const handleDelete = async () => {
    if (!transaction) return;
    setIsLoading(true);
    try {
      await TransactionService.deleteTransaction(transaction.id, transaction);
      Toast.show({
        type: "success",
        text1: "Transaksi Dihapus",
        text2: "Saldo dikembalikan.",
      });
      router.back();
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction)
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }} />
    );

  const isExpense = transaction.type === "expense";
  const colorClass = isExpense ? theme.danger : theme.success;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenLoader visible={isLoading} text="Menghapus..." />

      <View className="px-5 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full shadow-sm"
          style={{ backgroundColor: theme.surface }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText weight="bold" variant="h3">
          Detail Transaksi
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1 px-5 pt-2">
        <View
          className="rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden"
          style={{ backgroundColor: theme.surface }}
        >
          <View
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-50"
            style={{ backgroundColor: theme.border }}
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
                color={isExpense ? theme.danger : theme.success}
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
            style={{ borderColor: theme.border }}
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
              style={{ color: isExpense ? theme.danger : theme.success }}
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
            style={{ backgroundColor: theme.background }}
          >
            <View className="flex-row justify-between">
              <AppText>Sumber Dana</AppText>
              <View className="flex-row items-center gap-1">
                <Ionicons name="wallet-outline" size={14} color={theme.text} />
                <AppText weight="bold">{walletName}</AppText>
              </View>
            </View>
            <View className="flex-row justify-between">
              <AppText>Tipe</AppText>
              <AppText
                weight="bold"
                style={{ color: isExpense ? theme.danger : theme.success }}
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
          borderTopColor: theme.divider,
          backgroundColor: theme.surface,
        }}
      >
        <AppButton
          title="Edit"
          variant="outline"
          className="flex-1"
          onPress={() => setShowEditSheet(true)}
          leftIcon={
            <Ionicons name="create-outline" size={20} color={theme.text} />
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
