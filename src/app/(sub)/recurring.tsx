import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { RecurringItem } from "@/src/features/recurring/components/RecurringItem";
import { useRecurringScreen } from "@/src/features/recurring/hooks/useRecurringScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { RecurringFrequency } from "@/src/types/recurring";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

const FREQUENCIES: { label: string; value: RecurringFrequency }[] = [
  { label: "Harian", value: "daily" },
  { label: "Mingguan", value: "weekly" },
  { label: "Bulanan", value: "monthly" },
  { label: "Tahunan", value: "yearly" },
];

export default function RecurringScreen() {
  const { colors: theme } = useTheme();

  const {
    recurring,
    isSaving,
    categories,
    wallets,
    isAddModalVisible,
    setAddModalVisible,
    type,
    setType,
    amount,
    setAmount,
    category,
    setCategory,
    walletId,
    setWalletId,
    frequency,
    setFrequency,
    note,
    setNote,
    handleAddRecurring,
    handleDeleteRecurring,
    handleToggleActive,
    handleBack,
  } = useRecurringScreen();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
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
        renderItem={({ item }) => (
          <RecurringItem
            item={item}
            wallets={wallets}
            onToggle={handleToggleActive}
            onDelete={handleDeleteRecurring}
          />
        )}
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

              <CurrencyInput
                label="Nominal"
                value={amount}
                onChangeText={setAmount}
                containerClass="mb-4"
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
                {categories.map((cat) => (
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
