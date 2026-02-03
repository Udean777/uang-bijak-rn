import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAddWishlist } from "@/src/features/wishlist/hooks/useAddWishlist";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface AddWishlistSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AddWishlistSheet = ({
  visible,
  onClose,
}: AddWishlistSheetProps) => {
  const { colors, isDark } = useTheme();

  const {
    name,
    setName,
    price,
    setPrice,
    duration,
    setDuration,
    isLoading,
    handleSave,
  } = useAddWishlist(onClose);

  const DurationOption = ({ days, label }: { days: number; label: string }) => {
    const isSelected = duration === days;
    return (
      <TouchableOpacity
        onPress={() => setDuration(days)}
        className="flex-1 p-3 rounded-xl border items-center"
        style={{
          backgroundColor: isSelected
            ? isDark
              ? "rgba(147, 51, 234, 0.2)"
              : "#FAF5FF"
            : colors.surface,
          borderColor: isSelected ? "#9333EA" : colors.border,
        }}
      >
        <AppText
          weight="bold"
          style={{ color: isSelected ? "#9333EA" : colors.textSecondary }}
        >
          {days} Hari
        </AppText>
        <AppText variant="caption">{label}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: colors.modalOverlay }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              className="rounded-t-3xl h-[70%] w-full"
              style={{ backgroundColor: colors.background }}
            >
              <ModalHeader title="Wishlist Baru" onClose={onClose} />

              <ScrollView className="px-6">
                <View
                  className="mb-6 p-4 rounded-xl flex-row items-center gap-3"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(147, 51, 234, 0.15)"
                      : "#FAF5FF",
                  }}
                >
                  <Ionicons
                    name="hourglass-outline"
                    size={32}
                    color="#9333EA"
                  />
                  <View className="flex-1">
                    <AppText weight="bold" style={{ color: "#A855F7" }}>
                      Cooling-off Timer
                    </AppText>
                    <AppText
                      variant="caption"
                      className="leading-4"
                      style={{ color: "#C084FC" }}
                    >
                      Sistem akan menahanmu selama durasi yang dipilih sebelum
                      kamu boleh membelinya.
                    </AppText>
                  </View>
                </View>

                <AppInput
                  label="Nama Barang Impian"
                  placeholder="iPhone 15, Sepatu Jordan, dll"
                  value={name}
                  onChangeText={setName}
                />
                <CurrencyInput
                  label="Estimasi Harga"
                  value={price}
                  onChangeText={setPrice}
                />

                <View className="mt-2">
                  <AppText variant="label" className="mb-3">
                    Durasi Pikir-pikir
                  </AppText>
                  <View className="flex-row gap-3">
                    <DurationOption days={3} label="Pendek" />
                    <DurationOption days={7} label="Standar" />
                    <DurationOption days={30} label="Panjang" />
                  </View>
                </View>
              </ScrollView>

              <View className="p-6">
                <AppButton
                  title="Mulai Timer"
                  onPress={handleSave}
                  isLoading={isLoading}
                  className="mt-4"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
