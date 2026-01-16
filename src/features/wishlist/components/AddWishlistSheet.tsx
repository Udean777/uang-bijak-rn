import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { WishlistService } from "@/src/services/wishlistService";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface AddWishlistSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const AddWishlistSheet = ({
  visible,
  onClose,
}: AddWishlistSheetProps) => {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price) {
      Toast.show({ type: "error", text1: "Data tidak lengkap" });
      return;
    }

    setIsLoading(true);
    try {
      await WishlistService.addWishlist(user!.uid, {
        name,
        price: parseFloat(price),
        durationDays: duration,
      });
      Toast.show({
        type: "success",
        text1: "Masuk Wishlist",
        text2: `Timer ${duration} hari dimulai!`,
      });
      setName("");
      setPrice("");
      setDuration(7);
      onClose();
    } catch (e) {
      Toast.show({ type: "error", text1: "Gagal menyimpan" });
    } finally {
      setIsLoading(false);
    }
  };

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
            : theme.surface,
          borderColor: isSelected ? "#9333EA" : theme.border,
        }}
      >
        <AppText
          weight="bold"
          style={{ color: isSelected ? "#9333EA" : theme.textSecondary }}
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
          style={{ backgroundColor: theme.modalOverlay }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              className="rounded-t-3xl h-[70%] w-full"
              style={{ backgroundColor: theme.background }}
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
                <AppInput
                  label="Estimasi Harga (Rp)"
                  placeholder="0"
                  keyboardType="numeric"
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
