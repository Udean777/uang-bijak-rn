import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { Category, CategoryService } from "@/src/services/categoryService";
import { RecurringService } from "@/src/services/recurringService";
import {
  RecurringFrequency,
  RecurringTransaction,
} from "@/src/types/recurring";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const FREQUENCIES: { label: string; value: RecurringFrequency }[] = [
  { label: "Harian", value: "daily" },
  { label: "Mingguan", value: "weekly" },
  { label: "Bulanan", value: "monthly" },
  { label: "Tahunan", value: "yearly" },
];

export default function RecurringScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { wallets } = useWallets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Form State
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [walletId, setWalletId] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubR = RecurringService.subscribeRecurring(user.uid, (data) => {
      setRecurring(data);
      setIsLoading(false);
    });
    const unsubC = CategoryService.subscribeCategories(user.uid, setCategories);
    return () => {
      unsubR();
      unsubC();
    };
  }, [user]);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handleAddRecurring = async () => {
    if (!amount || !category || !walletId) {
      Toast.show({ type: "error", text1: "Mohon lengkapi data" });
      return;
    }

    setIsSaving(true);
    try {
      await RecurringService.addRecurring(user!.uid, {
        walletId,
        amount: parseFloat(amount),
        type,
        category,
        frequency,
        startDate: new Date(),
        note,
      });
      setAddModalVisible(false);
      resetForm();
      Toast.show({ type: "success", text1: "Transaksi berulang ditambahkan!" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setNote("");
    if (wallets.length > 0) setWalletId(wallets[0].id);
  };

  const renderItem = ({ item }: { item: RecurringTransaction }) => {
    const wallet = wallets.find((w) => w.id === item.walletId);
    const freqLabel = FREQUENCIES.find(
      (f) => f.value === item.frequency,
    )?.label;

    return (
      <View
        className="p-5 rounded-3xl mb-4 border"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Ionicons
                name={
                  item.type === "income"
                    ? "arrow-down-circle"
                    : "arrow-up-circle"
                }
                size={20}
                color={item.type === "income" ? "#10B981" : "#EF4444"}
              />
              <AppText weight="bold" variant="h3">
                {item.category}
              </AppText>
            </View>
            <AppText variant="caption">
              {freqLabel} • Rp {item.amount.toLocaleString("id-ID")}
            </AppText>
            <AppText variant="caption" color="secondary">
              Ke: {wallet?.name || "Dompet Terhapus"}
            </AppText>
          </View>
          <Switch
            value={item.isActive}
            onValueChange={(val) => RecurringService.toggleActive(item.id, val)}
          />
        </View>

        <View
          className="flex-row justify-between items-center pt-2 border-t border-gray-100"
          style={{ borderTopColor: theme.divider }}
        >
          <AppText variant="caption" color="secondary">
            Next: {new Date(item.nextExecutionDate).toLocaleDateString("id-ID")}
          </AppText>
          <TouchableOpacity
            onPress={() => RecurringService.deleteRecurring(item.id)}
            className="p-1"
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">
          Transaksi Berulang
        </AppText>
        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          className="p-2 -mr-2"
        >
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recurring}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="repeat-outline" size={64} color={theme.icon} />
            <AppText className="mt-4 text-center text-gray-500">
              Belum ada transaksi otomatis.{"\n"}Hemat waktu dengan fitur ini!
            </AppText>
            <AppButton
              title="Tambah Sekarang"
              className="mt-6 px-8"
              onPress={() => setAddModalVisible(true)}
            />
          </View>
        }
      />

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="rounded-t-[40px] p-6 pb-10"
            style={{ backgroundColor: theme.background }}
          >
            <ModalHeader
              title="Atur Transaksi Otomatis"
              onClose={() => setAddModalVisible(false)}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selector */}
              <View
                className="flex-row p-1 rounded-xl mb-6"
                style={{ backgroundColor: theme.surface }}
              >
                <TouchableOpacity
                  onPress={() => setType("expense")}
                  className={`flex-1 py-3 rounded-lg items-center ${type === "expense" ? "bg-red-100" : ""}`}
                >
                  <AppText
                    weight="bold"
                    color={type === "expense" ? "danger" : "default"}
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
                    color={type === "income" ? "success" : "default"}
                  >
                    Pemasukan
                  </AppText>
                </TouchableOpacity>
              </View>

              <AppInput
                label="Nominal (Rp)"
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                className="mb-4"
              />

              <AppText
                variant="caption"
                weight="bold"
                className="mb-2 uppercase"
              >
                Frekuensi
              </AppText>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    onPress={() => setFrequency(f.value)}
                    className="px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor:
                        frequency === f.value ? theme.primary : theme.surface,
                      borderColor:
                        frequency === f.value ? theme.primary : theme.border,
                    }}
                  >
                    <AppText
                      color={frequency === f.value ? "white" : "default"}
                      weight="bold"
                    >
                      {f.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <AppText
                variant="caption"
                weight="bold"
                className="mb-2 uppercase"
              >
                Kategori
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6"
              >
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
                        color={category === cat.name ? "white" : "default"}
                        weight="bold"
                      >
                        {cat.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <AppText
                variant="caption"
                weight="bold"
                className="mb-2 uppercase"
              >
                Sumber Dana
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6"
              >
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => setWalletId(w.id)}
                    className="mr-3 px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor:
                        walletId === w.id ? theme.primary : theme.surface,
                      borderColor:
                        walletId === w.id ? theme.primary : theme.border,
                    }}
                  >
                    <AppText
                      color={walletId === w.id ? "white" : "default"}
                      weight="bold"
                    >
                      {w.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <AppInput
                label="Catatan (Opsional)"
                placeholder="Misal: Sewa Kost, Gaji Bulanan"
                value={note}
                onChangeText={setNote}
                className="mb-8"
              />

              <AppButton
                title="Simpan Transaksi"
                onPress={handleAddRecurring}
                isLoading={isSaving}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
