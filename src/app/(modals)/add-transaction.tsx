import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { Category, CategoryService } from "@/src/services/categoryService";
import { TransactionService } from "@/src/services/transactionService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { wallets } = useWallets();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [classification, setClassification] = useState<"need" | "want">("need");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editTxId, setEditTxId] = useState<string | null>(null);
  const [oldTxData, setOldTxData] = useState<any>(null);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = CategoryService.subscribeCategories(
      user.uid,
      (data) => {
        setCategories(data);

        if (data.length > 0 && !category) {
          const defaultCat = data.find((c) => c.type === type) || data[0];
          setCategory(defaultCat.name);
        }
      }
    );

    return () => unsubscribe();
  }, [user, type]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  useEffect(() => {
    if (params.editData) {
      try {
        const data = JSON.parse(params.editData as string);

        setIsEditMode(true);
        setEditTxId(data.id);
        setOldTxData(data);

        setAmount(data.amount.toString());
        setType(data.type);
        setCategory(data.category);
        setClassification(data.classification || "need");
        setSelectedWalletId(data.walletId);
        setNote(data.note || "");
      } catch (e) {
        console.error("Gagal parse editData", e);
      }
    }
  }, [params.editData]);

  const handleAddCategory = () => {
    setNewCategoryName("");
    setCategoryModalVisible(true);
  };

  const saveNewCategory = async () => {
    if (!newCategoryName.trim()) {
      return; // Jangan simpan jika kosong
    }

    if (user) {
      try {
        await CategoryService.addCategory(user.uid, newCategoryName, type);

        // Pilih otomatis kategori yang baru dibuat
        setCategory(newCategoryName);

        setCategoryModalVisible(false);
        Toast.show({ type: "success", text1: "Kategori ditambahkan" });
      } catch (error) {
        Toast.show({ type: "error", text1: "Gagal menambah kategori" });
      }
    }
  };

  const handleSave = async () => {
    if (!amount || !selectedWalletId) {
      Toast.show({
        type: "error",
        text1: "Data Belum Lengkap",
        text2: "Mohon isi nominal dan pilih dompet.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        walletId: selectedWalletId,
        amount: parseFloat(amount),
        type,
        category,
        classification: type === "expense" ? classification : null,
        date: new Date(),
        note,
      };

      if (isEditMode && editTxId && oldTxData) {
        await TransactionService.updateTransaction(
          editTxId,
          oldTxData,
          payload as any
        );
        Toast.show({ type: "success", text1: "Transaksi Diperbarui" });
        router.dismissAll();
      } else {
        await TransactionService.addTransaction(user!.uid, payload as any);
        Toast.show({ type: "success", text1: "Transaksi Disimpan" });
        router.back();
      }
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenLoader
        visible={isLoading}
        text={isEditMode ? "Updating..." : "Menyimpan..."}
      />

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
            autoFocus={!isEditMode}
          />
        </View>

        <View className="mb-6">
          <AppText
            variant="caption"
            weight="bold"
            className="text-gray-500 uppercase mb-2"
          >
            Kategori
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              className="mr-3 px-4 py-2 rounded-full border border-dashed border-gray-400 justify-center"
              onPress={handleAddCategory}
            >
              <AppText color="secondary" weight="bold">
                + Baru
              </AppText>
            </TouchableOpacity>

            {categories
              .filter((c) => c.type === type)
              .map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.name)}
                  className={`mr-3 px-4 py-2 rounded-full border ${
                    category === cat.name
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <AppText
                    className={
                      category === cat.name ? "text-white" : "text-gray-700"
                    }
                  >
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              ))}
          </ScrollView>
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
                  Wajib, Primer, Tagihan.
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
                  Hiburan, Jajan, Hobi.
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
            placeholder="Keterangan transaksi..."
            multiline
            className="h-24 py-4"
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View className="p-5 border-t border-gray-100">
        <AppButton
          title={isEditMode ? "Update Transaksi" : "Simpan Transaksi"}
          onPress={handleSave}
          isLoading={isLoading}
          variant={type === "expense" ? "danger" : "primary"}
          className={type === "expense" ? "" : "bg-green-600 border-green-600"}
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isCategoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-center items-center p-5">
            <View className="bg-white w-full rounded-2xl p-6 shadow-lg">
              <AppText variant="h3" weight="bold" className="mb-2">
                Tambah Kategori
              </AppText>
              <AppText color="secondary" className="mb-4">
                Masukkan nama kategori{" "}
                {type === "income" ? "Pemasukan" : "Pengeluaran"} baru.
              </AppText>

              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-base text-gray-900"
                placeholder="Contoh: Investasi, Parkir, Amal"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus={true}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <AppButton
                    title="Batal"
                    variant="ghost"
                    onPress={() => setCategoryModalVisible(false)}
                  />
                </View>
                <View className="flex-1">
                  <AppButton
                    title="Simpan"
                    onPress={saveNewCategory}
                    disabled={!newCategoryName.trim()}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
