import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { TemplateService } from "@/src/services/templateService";
import { TransactionTemplate } from "@/src/types/template";

export default function ManageTemplatesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { wallets } = useWallets();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Makan");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = TemplateService.subscribeTemplates(user.uid, setTemplates);
    return () => unsub();
  }, [user]);

  // Set default wallet saat modal buka
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId)
      setSelectedWalletId(wallets[0].id);
  }, [wallets, isModalVisible]);

  const handleSave = async () => {
    if (!name || !amount || !selectedWalletId) {
      Toast.show({ type: "error", text1: "Data tidak lengkap" });
      return;
    }
    setIsLoading(true);
    try {
      await TemplateService.addTemplate({
        userId: user!.uid,
        name,
        amount: parseFloat(amount),
        type: "expense", // Shortcut biasanya untuk pengeluaran rutin
        category,
        walletId: selectedWalletId,
        icon: "flash", // Default icon
      });
      Toast.show({ type: "success", text1: "Shortcut dibuat!" });
      setModalVisible(false);
      setName("");
      setAmount("");
    } catch (e) {
      Toast.show({ type: "error", text1: "Gagal" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Shortcut", "Yakin?", [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => TemplateService.deleteTemplate(id),
      },
    ]);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{
          backgroundColor: theme.background,
          borderBottomColor: theme.divider,
        }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <AppText variant="h3" weight="bold">
            Kelola Shortcut
          </AppText>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <AppText weight="bold">+ Tambah</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View
            className="flex-row items-center justify-between p-4 rounded-2xl mb-3 border"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? "rgba(234, 88, 12, 0.15)"
                    : "#FFEDD5",
                }}
              >
                <Ionicons name="flash" size={20} color="#EA580C" />
              </View>
              <View>
                <AppText weight="bold">{item.name}</AppText>
                <AppText variant="caption">
                  {item.category} • Rp {item.amount.toLocaleString()}
                </AppText>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Belum Ada Shortcut"
            message="Buat tombol cepat untuk transaksi yang sering kamu lakukan. Contoh: 'Kopi Pagi', 'Parkir', 'Uang Kas'."
            icon="flash-outline"
            actionLabel="Buat Shortcut"
            onAction={() => setModalVisible(true)}
          />
        }
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: theme.modalOverlay }}
        >
          <View
            className="rounded-t-3xl p-6 h-[70%]"
            style={{ backgroundColor: theme.background }}
          >
            <ModalHeader
              title="Shortcut Baru"
              onClose={() => setModalVisible(false)}
            />

            <ScrollView>
              <AppInput
                label="Nama Shortcut"
                placeholder="Contoh: Kopi Kenangan"
                value={name}
                onChangeText={setName}
              />
              <AppInput
                label="Nominal (Rp)"
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <AppInput
                label="Kategori"
                placeholder="Makan, Transport, dll"
                value={category}
                onChangeText={setCategory}
              />

              <AppText variant="label" className="mb-2 my-2">
                Sumber Dana Otomatis
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4 mt-2"
              >
                {wallets.map((w) => {
                  const isSelected = selectedWalletId === w.id;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => setSelectedWalletId(w.id)}
                      className="mr-2 px-4 py-2 rounded-full border"
                      style={{
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      }}
                    >
                      <AppText
                        color={isSelected ? "white" : "default"}
                        weight={isSelected ? "bold" : "regular"}
                      >
                        {w.name}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </ScrollView>

            <AppButton
              title="Simpan Shortcut"
              onPress={handleSave}
              isLoading={isLoading}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
