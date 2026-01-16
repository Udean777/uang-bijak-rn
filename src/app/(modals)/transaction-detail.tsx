import { AppBadge } from "@/src/components/atoms/AppBadge";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("id-ID", { dateStyle: "full" });
const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    val
  );

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const transaction: Transaction = JSON.parse(params.data as string);

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      "Hapus Transaksi?",
      "Saldo dompet akan dikembalikan seperti semula.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await TransactionService.deleteTransaction(
                transaction.id,
                transaction
              );
              Toast.show({
                type: "success",
                text1: "Dihapus",
                text2: "Saldo telah disesuaikan",
              });
              router.back();
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Gagal",
                text2: error.message,
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: "/(modals)/add-transaction",
      params: { editData: JSON.stringify(transaction) },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenLoader visible={isLoading} text="Menghapus..." />
      <ModalHeader title="Detail Transaksi" />

      <ScrollView className="p-5">
        <View className="items-center py-8 bg-gray-50 rounded-3xl mb-6 border border-gray-100">
          <AppText
            variant="h1"
            weight="bold"
            className={
              transaction.type === "expense" ? "text-red-600" : "text-green-600"
            }
          >
            {transaction.type === "expense" ? "-" : "+"}
            {formatRupiah(transaction.amount)}
          </AppText>
          <AppText variant="body" color="secondary" className="mt-2">
            {transaction.category}
          </AppText>

          {transaction.classification && (
            <AppBadge
              label={transaction.classification.toUpperCase()}
              variant={
                transaction.classification === "need" ? "warning" : "error"
              }
              className="mt-3"
            />
          )}
        </View>

        <View className="gap-y-6 px-2">
          <View>
            <AppText variant="label" color="secondary">
              Tanggal
            </AppText>
            <AppText variant="body" weight="medium">
              {formatDate(transaction.date)}
            </AppText>
          </View>

          <View>
            <AppText variant="label" color="secondary">
              Dompet Sumber
            </AppText>
            <View className="flex-row items-center gap-2 mt-1">
              <Ionicons name="wallet-outline" size={18} color="#4B5563" />
              <AppText variant="body" weight="medium">
                Dompet ID: ...{transaction.walletId.slice(-4)}
              </AppText>
            </View>
          </View>

          <View>
            <AppText variant="label" color="secondary">
              Catatan
            </AppText>
            <AppText variant="body" className="italic text-gray-700">
              {transaction.note || "Tidak ada catatan"}
            </AppText>
          </View>
        </View>

        <View className="mt-12 gap-y-3">
          <AppButton
            title="Edit Transaksi"
            variant="outline"
            onPress={handleEdit}
            leftIcon={
              <Ionicons name="create-outline" size={20} color="black" />
            }
          />
          <AppButton
            title="Hapus Transaksi"
            variant="danger"
            className="bg-red-50 border-red-50"
            style={{ backgroundColor: "#D00000", borderColor: "#D00000" }}
            onPress={handleDelete}
          >
            <AppText weight="bold" className="text-red-600">
              Hapus Transaksi
            </AppText>
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}
