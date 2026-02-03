import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { formatCurrency } from "@/src/hooks/useCurrencyFormat";
import { useTheme } from "@/src/hooks/useTheme";
import { Transaction } from "@/src/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
import { useEditTransactionSheet } from "../hooks/useEditTransactionSheet";

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
  const { colors, isDark } = useTheme();
  const { wallets } = useWallets();

  const { formState, setters, categories, isLoading, handleUpdate } =
    useEditTransactionSheet({ transaction, visible, onClose });

  const { amount, note, category, selectedWalletId } = formState;
  const { setAmount, setNote, setCategory, setSelectedWalletId } = setters;

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
              style={{ backgroundColor: colors.background }}
            >
              <View className="items-center pt-4 pb-2">
                <View
                  className="w-12 h-1.5 rounded-full"
                  style={{ backgroundColor: colors.border }}
                />
              </View>

              <View
                className="px-5 pb-4 flex-row justify-between items-center border-b"
                style={{ borderBottomColor: colors.divider }}
              >
                <AppText variant="h3" weight="bold">
                  Edit Transaksi
                </AppText>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="close" size={20} color={colors.icon} />
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
                        color: colors.text,
                        borderBottomColor: colors.divider,
                      }}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={(text) => setAmount(formatCurrency(text))}
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
                                ? colors.primary
                                : colors.surface,
                            borderColor:
                              category === cat.name
                                ? colors.primary
                                : colors.border,
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
                                  ? colors.text
                                  : "#111827"
                                : colors.surface,
                            borderColor:
                              selectedWalletId === w.id
                                ? isDark
                                  ? colors.text
                                  : "#111827"
                                : colors.border,
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
                                ? { color: colors.background }
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
                  style={{ borderTopColor: colors.divider }}
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
