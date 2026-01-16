import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { db } from "@/src/config/firebase";
import { EditTransactionSheet } from "@/src/features/transactions/components/EditTransactionSheet";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    val
  );

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

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

  if (!transaction) return <View className="flex-1 bg-white" />;

  const isExpense = transaction.type === "expense";
  const colorClass = isExpense ? "text-red-600" : "text-green-600";

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenLoader visible={isLoading} text="Menghapus..." />

      <View className="px-5 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white p-2 rounded-full shadow-sm"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <AppText weight="bold" variant="h3">
          Detail Transaksi
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1 px-5 pt-2">
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 rounded-full opacity-50" />

          <View className="items-center mb-6">
            <View
              className={`w-16 h-16 ${isExpense ? "bg-red-50" : "bg-green-50"} rounded-full items-center justify-center mb-3`}
            >
              <Ionicons
                name={
                  transaction.category === "Makan" ? "fast-food" : "pricetag"
                }
                size={32}
                color={isExpense ? "#DC2626" : "#16A34A"}
              />
            </View>
            <AppText variant="h3" weight="bold" className="text-gray-800">
              {transaction.category}
            </AppText>
            <AppText color="secondary" variant="caption">
              {formatDate(transaction.date)} • {formatTime(transaction.date)}
            </AppText>
          </View>

          <View className="h-[1px] w-full border-t border-dashed border-gray-300 my-4" />

          <View className="items-center mb-6">
            <AppText
              variant="caption"
              className="uppercase tracking-widest text-gray-400 mb-1"
            >
              Total Transaksi
            </AppText>
            <AppText variant="h1" weight="bold" className={colorClass}>
              {isExpense ? "-" : "+"}
              {formatRupiah(transaction.amount)}
            </AppText>
            {transaction.classification && (
              <View
                className={`mt-2 px-3 py-1 rounded-full ${transaction.classification === "need" ? "bg-blue-50" : "bg-purple-50"}`}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  className={
                    transaction.classification === "need"
                      ? "text-blue-600"
                      : "text-purple-600"
                  }
                >
                  {transaction.classification === "need"
                    ? "NEEDS (Kebutuhan)"
                    : "WANTS (Keinginan)"}
                </AppText>
              </View>
            )}
          </View>

          <View className="bg-gray-50 rounded-xl p-4 gap-y-3">
            <View className="flex-row justify-between">
              <AppText color="secondary">Sumber Dana</AppText>
              <View className="flex-row items-center gap-1">
                <Ionicons name="wallet-outline" size={14} color="black" />
                <AppText weight="bold">{walletName}</AppText>
              </View>
            </View>
            <View className="flex-row justify-between">
              <AppText color="secondary">Tipe</AppText>
              <AppText
                weight="bold"
                className={isExpense ? "text-red-600" : "text-green-600"}
              >
                {isExpense ? "Pengeluaran" : "Pemasukan"}
              </AppText>
            </View>
            <View className="flex-row justify-between items-start">
              <AppText color="secondary">Catatan</AppText>
              <AppText
                weight="medium"
                className="text-right flex-1 ml-4 text-gray-800"
              >
                {transaction.note || "-"}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-5 bg-white border-t border-gray-100 flex-row gap-3">
        <AppButton
          title="Edit"
          variant="outline"
          className="flex-1"
          onPress={() => setShowEditSheet(true)}
          leftIcon={<Ionicons name="create-outline" size={20} color="black" />}
        />
        <AppButton
          title="Hapus"
          variant="danger"
          className="flex-1 bg-red-50 border-red-50"
          style={{ backgroundColor: "#DC2626", borderColor: "#DC2626" }}
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
