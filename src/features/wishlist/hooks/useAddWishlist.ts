import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useWishlistStore } from "../store/useWishlistStore";

export const useAddWishlist = (onClose: () => void) => {
  const { user } = useAuthStore();
  const { addWishlist } = useWishlistStore();

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
      await addWishlist(user!.uid, {
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

  return {
    name,
    setName,
    price,
    setPrice,
    duration,
    setDuration,
    isLoading,
    handleSave,
  };
};
