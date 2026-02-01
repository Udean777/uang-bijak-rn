import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import React from "react";
import {
  Keyboard,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  categoryName: string;
  setCategoryName: (val: string) => void;
  type: "income" | "expense" | "transfer";
}

export const AddCategoryModal = ({
  visible,
  onClose,
  onSave,
  categoryName,
  setCategoryName,
  type,
}: AddCategoryModalProps) => {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View
            className="w-full rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: colors.background }}
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
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Contoh: Investasi, Parkir, Amal"
              placeholderTextColor={colors.icon}
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus={true}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <AppButton title="Batal" variant="outline" onPress={onClose} />
              </View>
              <View className="flex-1">
                <AppButton
                  title="Simpan"
                  onPress={onSave}
                  disabled={!categoryName.trim()}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
