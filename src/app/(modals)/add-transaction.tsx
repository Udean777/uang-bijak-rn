import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { TransactionService } from "@/src/services/transactionService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const CATEGORIES = [
  "Makan",
  "Transport",
  "Belanja",
  "Tagihan",
  "Gaji",
  "Bonus",
  "Lainnya",
];

export const AddTransactionScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { wallets } = useWallets();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [classification, setClassification] = useState<"need" | "want">("need");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handleSave = async () => {
    if (!amount || !selectedWalletId) {
      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: "Mohon lengkapi data.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await TransactionService.addTransaction(user!.uid, {
        walletId: selectedWalletId,
        amount: parseFloat(amount),
        type,
        category,
        classification: type === "expense" ? classification : null,
        date: new Date(),
        note,
      });

      Toast.show({
        type: "success",
        text1: "Berhasil!",
        text2: "Transaksi telah tercatat.",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-5">
        <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
          <TouchableOpacity
            onPress={() => setType("expense")}
            className={`flex-1 py-3 rounded-lg items-center ${type === "expense" ? "bg-red-100" : ""}`}
          >
            <AppText
              weight="bold"
              className={type === "expense" ? "text-red-600" : "text-gray-500"}
            >
              Pengeluaran
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType("income")}
            className={`flex-1 py-3 rounded-lg items-center ${type === "income" ? "bg-green-100" : ""}`}
          >
            <AppText
              weight="bold"
              className={type === "income" ? "text-green-600" : "text-gray-500"}
            >
              Pemasukan
            </AppText>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <AppText
            variant="caption"
            weight="bold"
            className="text-gray-500 uppercase mb-2"
          >
            Nominal (Rp)
          </AppText>
          <TextInput
            className="text-4xl font-bold text-gray-900 border-b border-gray-200 pb-2"
            keyboardType="numeric"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        {type === "expense" && (
          <View className="mb-6">
            <AppText
              variant="caption"
              weight="bold"
              className="text-gray-500 uppercase mb-3"
            >
              Jenis Pengeluaran (Analisa)
            </AppText>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setClassification("need")}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  classification === "need"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <AppText weight="bold" className="text-lg text-blue-900 mb-1">
                  Needs 🍞
                </AppText>
                <AppText variant="caption" className="text-gray-500">
                  Kebutuhan primer, tagihan wajib.
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setClassification("want")}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  classification === "want"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <AppText weight="bold" className="text-lg text-purple-900 mb-1">
                  Wants 🎮
                </AppText>
                <AppText variant="caption" className="text-gray-500">
                  Hiburan, jajan, keinginan sekunder.
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="mb-6">
          <AppText
            variant="caption"
            weight="bold"
            className="text-gray-500 uppercase mb-2"
          >
            Sumber Dana
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {wallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => setSelectedWalletId(w.id)}
                className={`mr-3 px-4 py-2 rounded-full border ${
                  selectedWalletId === w.id
                    ? "bg-gray-900 border-gray-900"
                    : "bg-white border-gray-300"
                }`}
              >
                <AppText
                  color={selectedWalletId === w.id ? "white" : "default"}
                  className={selectedWalletId === w.id ? "" : "text-gray-700"}
                >
                  {w.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-8">
          <AppInput
            label="Catatan"
            value={note}
            onChangeText={setNote}
            placeholder="Beli makan siang..."
            multiline
            className="h-24 py-4"
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View className="p-5 border-t border-gray-100">
        <AppButton
          title="Simpan Transaksi"
          onPress={handleSave}
          isLoading={isLoading}
          variant={type === "expense" ? "danger" : "primary"}
          className={type === "expense" ? "" : "bg-green-600 border-green-600"}
        />
      </View>
    </View>
  );
};
