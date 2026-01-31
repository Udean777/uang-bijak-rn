import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { db } from "@/src/config/firebase";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { EditWalletSheet } from "@/src/features/wallets/components/EditWalletSheet";
import { TransactionService } from "@/src/services/transactionService";
import { WalletService } from "@/src/services/walletService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

import { Transaction } from "@/src/types/transaction";
import { Wallet } from "@/src/types/wallet";

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

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const walletId = useMemo(() => {
    if (params.id) return Array.isArray(params.id) ? params.id[0] : params.id;
    if (typeof params.data === "string") {
      try {
        return JSON.parse(params.data).id;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [params]);

  const [wallet, setWallet] = useState<Wallet | null>(() => {
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

  useEffect(() => {
    if (!walletId) return;

    const unsub = onSnapshot(
      doc(db, "wallets", walletId),
      (docSnap) => {
        if (docSnap.exists()) {
          setWallet({ id: docSnap.id, ...docSnap.data() } as Wallet);
        } else {
          setWallet(null);
        }
      },
      (error) => {
        console.error("[WalletDetail] Snapshot error:", error);
      },
    );

    return () => unsub();
  }, [walletId]);

  useEffect(() => {
    if (!user || !walletId) return;

    const unsub = TransactionService.subscribeTransactions(
      user.uid,
      (allData) => {
        const filtered = allData.filter((t) => t.walletId === walletId);
        setTransactions(filtered);
      },
    );

    return () => unsub();
  }, [user, walletId]);

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

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

  useEffect(() => {
    if (!wallet && !isLoading) {
      Toast.show({
        type: "error",
        text1: "Data Error",
        text2: "Dompet tidak ditemukan",
      });
      handleBackNavigation();
    }
  }, [wallet]);

  if (!wallet)
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenLoader visible={isLoading} text="Menghapus..." />

      <View
        className="px-5 pb-4 border-b flex-row items-center justify-between"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={handleBackNavigation}>
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
              backgroundColor: Colors.light.danger,
              borderColor: Colors.light.danger,
            }}
            onPress={onDeletePress}
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
