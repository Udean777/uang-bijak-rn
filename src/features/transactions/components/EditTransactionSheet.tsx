import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { Category, CategoryService } from "@/src/services/categoryService";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface EditTransactionSheetProps {
  visible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const EditTransactionSheet = ({
  visible,
  onClose,
  transaction,
}: EditTransactionSheetProps) => {
  const { user } = useAuth();
  const { wallets } = useWallets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction && visible) {
      setAmount(transaction.amount.toString());
      setNote(transaction.note || "");
      setCategory(transaction.category);
      setSelectedWalletId(transaction.walletId);
    }
  }, [transaction, visible]);

  useEffect(() => {
    if (user && visible && transaction) {
      const unsub = CategoryService.subscribeCategories(user.uid, (data) => {
        setCategories(data.filter((c) => c.type === transaction.type));
      });
      return () => unsub();
    }
  }, [user, visible, transaction]);

  const handleUpdate = async () => {
    if (!transaction || !amount || !selectedWalletId) return;

    setIsLoading(true);
    try {
      await TransactionService.updateTransaction(transaction.id, transaction, {
        amount: parseFloat(amount),
        category,
        note,
        walletId: selectedWalletId,
        type: transaction.type,
        classification: transaction.classification,
        date: new Date(transaction.date),
      } as any);

      Toast.show({ type: "success", text1: "Transaksi Diperbarui" });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Update",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              className="rounded-t-3xl h-[85%] w-full"
              style={{ backgroundColor: theme.background }}
            >
              <View className="items-center pt-4 pb-2">
                <View
                  className="w-12 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.border }}
                />
              </View>

              <View
                className="px-5 pb-4 flex-row justify-between items-center border-b"
                style={{ borderBottomColor: theme.divider }}
              >
                <AppText variant="h3" weight="bold">
                  Edit Transaksi
                </AppText>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: theme.surface }}
                >
                  <Ionicons name="close" size={20} color={theme.icon} />
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
              >
                <ScrollView className="flex-1 p-5">
                  <View className="mb-6">
                    <AppText
                      variant="caption"
                      weight="bold"
                      className="uppercase mb-2"
                    >
                      Nominal (Rp)
                    </AppText>
                    <TextInput
                      className="text-4xl font-bold pb-2 border-b"
                      style={{
                        color: theme.text,
                        borderBottomColor: theme.divider,
                      }}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>

                  <View className="mb-6">
                    <AppText
                      variant="caption"
                      weight="bold"
                      className="uppercase mb-2"
                    >
                      Kategori
                    </AppText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => setCategory(cat.name)}
                          className="mr-3 px-4 py-2 rounded-full border"
                          style={{
                            backgroundColor:
                              category === cat.name
                                ? theme.primary
                                : theme.surface,
                            borderColor:
                              category === cat.name
                                ? theme.primary
                                : theme.border,
                          }}
                        >
                          <AppText
                            color={category === cat.name ? "white" : "default"}
                          >
                            {cat.name}
                          </AppText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View className="mb-6">
                    <AppText
                      variant="caption"
                      weight="bold"
                      className="uppercase mb-2"
                    >
                      Sumber Dana
                    </AppText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
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
                                  : "#111827" // gray-900
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
                      multiline
                      className="h-24 py-4"
                      textAlignVertical="top"
                    />
                  </View>
                </ScrollView>

                <View
                  className="p-5 border-t pb-10"
                  style={{ borderTopColor: theme.divider }}
                >
                  <AppButton
                    title="Simpan Perubahan"
                    onPress={handleUpdate}
                    isLoading={isLoading}
                  />
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
