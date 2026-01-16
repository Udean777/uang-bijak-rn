import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

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

  // Fungsi Close Navigasi
  const handleClose = () => {
    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenLoader
        visible={isLoading}
        text={isEditMode ? "Updating..." : "Menyimpan..."}
      />

      <ModalHeader
        title={isEditMode ? "Edit Transaksi" : "Tambah Transaksi"}
        subtitle={
          isEditMode ? "Perbarui data transaksi" : "Catat aliran dana baru"
        }
        onClose={handleClose}
      />

      <ScrollView className="flex-1 p-5">
        <View
          className="flex-row p-1 rounded-xl mb-6"
          style={{ backgroundColor: theme.surface }}
        >
          <TouchableOpacity
            onPress={() => setType("expense")}
            className={`flex-1 py-3 rounded-lg items-center ${type === "expense" ? (isDark ? "bg-red-900/30" : "bg-red-100") : ""}`}
          >
            <AppText
              weight="bold"
              style={{
                color:
                  type === "expense"
                    ? theme.danger
                    : isDark
                      ? theme.text
                      : "gray",
                opacity: type === "expense" ? 1 : 0.5,
              }}
            >
              Pengeluaran
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType("income")}
            className={`flex-1 py-3 rounded-lg items-center ${type === "income" ? (isDark ? "bg-green-900/30" : "bg-green-100") : ""}`}
          >
            <AppText
              weight="bold"
              style={{
                color:
                  type === "income"
                    ? theme.success
                    : isDark
                      ? theme.text
                      : "gray",
                opacity: type === "income" ? 1 : 0.5,
              }}
            >
              Pemasukan
            </AppText>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <AppText variant="caption" weight="bold" className="uppercase mb-2">
            Nominal (Rp)
          </AppText>
          <TextInput
            className="text-4xl font-bold pb-2 border-b"
            style={{
              borderBottomColor: theme.divider,
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.icon}
            value={amount}
            onChangeText={setAmount}
            autoFocus={!isEditMode}
          />
        </View>

        <View className="mb-6">
          <AppText variant="caption" weight="bold" className="uppercase mb-2">
            Kategori
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              className="mr-3 px-4 py-2 rounded-full border border-dashed justify-center"
              style={{ borderColor: theme.border }}
              onPress={handleAddCategory}
            >
              <AppText weight="bold">+ Baru</AppText>
            </TouchableOpacity>

            {categories
              .filter((c) => c.type === type)
              .map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.name)}
                  className="mr-3 px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor:
                      category === cat.name ? theme.primary : theme.surface,
                    borderColor:
                      category === cat.name ? theme.primary : theme.border,
                  }}
                >
                  <AppText
                    weight="bold"
                    color={category === cat.name ? "white" : "default"}
                  >
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {type === "expense" && (
          <View className="mb-6">
            <AppText variant="caption" weight="bold" className="uppercase mb-3">
              Jenis Pengeluaran (Analisa)
            </AppText>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setClassification("need")}
                className="flex-1 p-4 rounded-xl border-2"
                style={{
                  backgroundColor:
                    classification === "need"
                      ? isDark
                        ? "rgba(37, 99, 235, 0.1)"
                        : "#EFF6FF"
                      : theme.surface,
                  borderColor:
                    classification === "need" ? "#3B82F6" : theme.border,
                }}
              >
                <AppText
                  weight="bold"
                  className="text-lg mb-1"
                  style={{
                    color: classification === "need" ? "#3B82F6" : theme.text,
                  }}
                >
                  Needs 🍞
                </AppText>
                <AppText variant="caption">Wajib, Primer, Tagihan.</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setClassification("want")}
                className="flex-1 p-4 rounded-xl border-2"
                style={{
                  backgroundColor:
                    classification === "want"
                      ? isDark
                        ? "rgba(147, 51, 234, 0.1)"
                        : "#FAF5FF"
                      : theme.surface,
                  borderColor:
                    classification === "want" ? "#A855F7" : theme.border,
                }}
              >
                <AppText
                  weight="bold"
                  className="text-lg mb-1"
                  style={{
                    color: classification === "want" ? "#A855F7" : theme.text,
                  }}
                >
                  Wants 🎮
                </AppText>
                <AppText variant="caption">Hiburan, Jajan, Hobi.</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="mb-6">
          <AppText variant="caption" weight="bold" className="uppercase mb-2">
            Sumber Dana
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {wallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => setSelectedWalletId(w.id)}
                className="mr-3 px-4 py-2 rounded-full border"
                style={{
                  backgroundColor:
                    selectedWalletId === w.id
                      ? isDark
                        ? theme.text
                        : "#111827"
                      : theme.surface,
                  borderColor:
                    selectedWalletId === w.id
                      ? isDark
                        ? theme.text
                        : "#111827"
                      : theme.border,
                }}
              >
                <AppText
                  color={
                    selectedWalletId === w.id
                      ? isDark
                        ? "default"
                        : "white"
                      : "default"
                  }
                  weight={selectedWalletId === w.id ? "bold" : "regular"}
                  style={
                    selectedWalletId === w.id && isDark
                      ? { color: theme.background }
                      : undefined
                  }
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

      <View className="p-5 border-t" style={{ borderTopColor: theme.divider }}>
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
            <View
              className="w-full rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: theme.background }}
            >
              <AppText variant="h3" weight="bold" className="mb-2">
                Tambah Kategori
              </AppText>
              <AppText color="default" className="mb-4">
                Masukkan nama kategori{" "}
                {type === "income" ? "Pemasukan" : "Pengeluaran"} baru.
              </AppText>

              <TextInput
                className="border rounded-xl p-4 mb-6 text-base"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                placeholder="Contoh: Investasi, Parkir, Amal"
                placeholderTextColor={theme.icon}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus={true}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <AppButton
                    title="Batal"
                    variant="danger"
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
