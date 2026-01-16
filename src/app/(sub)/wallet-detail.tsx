import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { TransactionService } from "@/src/services/transactionService";
import { WalletService } from "@/src/services/walletService";
import { Transaction } from "@/src/types/transaction";
import { Wallet } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export default function WalletDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [wallet] = useState<Wallet | null>(() => {
    if (typeof params.data === "string") {
      try {
        return JSON.parse(params.data);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  useEffect(() => {
    if (!wallet) {
      Toast.show({
        type: "error",
        text1: "Data Error",
        text2: "Dompet tidak ditemukan",
      });
      handleBackNavigation();
    }
  }, [wallet]);

  useEffect(() => {
    if (!user || !wallet?.id) return;

    const unsub = TransactionService.subscribeTransactions(
      user.uid,
      (allData) => {
        const filtered = allData.filter((t) => t.walletId === wallet.id);
        setTransactions(filtered);
      }
    );

    return () => unsub();
  }, [user, wallet]);

  const onDeletePress = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      await WalletService.deleteWallet(wallet.id);
      Toast.show({ type: "success", text1: "Dompet dihapus" });
      setShowDeleteDialog(false);
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleEdit = () => {
    if (!wallet) return;
    router.push({
      pathname: "/(modals)/add-wallet",
      params: { editData: JSON.stringify(wallet) },
    });
  };

  if (!wallet) return <View className="flex-1 bg-white" />;

  return (
    <View className="flex-1 bg-white">
      <ScreenLoader visible={isLoading} text="Menghapus..." />

      <View className="px-5  pb-4 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={handleBackNavigation}>
          <Ionicons name="arrow-back" size={24} color="black" />
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
            <AppText className="text-white/80 font-bold uppercase tracking-widest">
              {wallet.type}
            </AppText>
          </View>

          <AppText className="text-white/80 mb-1">Saldo Saat Ini</AppText>
          <AppText className="text-white text-4xl font-bold mb-2">
            {formatRupiah(wallet.balance)}
          </AppText>
          <AppText className="text-white text-lg font-medium">
            {wallet.name}
          </AppText>
        </View>

        <View className="px-5 flex-row gap-3 mb-8">
          <AppButton
            title="Edit"
            variant="outline"
            className="flex-1"
            onPress={handleEdit}
            leftIcon={
              <Ionicons name="create-outline" size={18} color="black" />
            }
          />
          <AppButton
            title="Hapus"
            variant="danger"
            className="flex-1 bg-red-50 border-red-50"
            style={{ backgroundColor: "#D00000", borderColor: "#D00000" }}
            onPress={onDeletePress}
            leftIcon={<Ionicons name="trash-outline" size={18} color="white" />}
          />
        </View>

        <View className="px-5 pb-10">
          <AppText variant="h3" weight="bold" className="mb-4">
            Riwayat Transaksi
          </AppText>
          {transactions.length === 0 ? (
            <View className="items-center py-10 bg-gray-50 rounded-xl">
              <AppText color="secondary">
                Belum ada transaksi di dompet ini.
              </AppText>
            </View>
          ) : (
            transactions.map((t) => (
              <View
                key={t.id}
                className="mb-3 rounded-xl overflow-hidden border border-gray-100"
              >
                <TransactionItem
                  transaction={t}
                  onPress={(item) =>
                    router.push({
                      pathname: "/(modals)/transaction-detail",
                      params: { data: JSON.stringify(item) },
                    })
                  }
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Hapus Dompet?"
        message="Semua riwayat transaksi yang terhubung dengan dompet ini akan kehilangan referensinya. Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Permanen"
        cancelText="Batal"
        variant="danger"
        isLoading={isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
