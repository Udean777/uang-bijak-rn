import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useSubscriptionStore } from "../store/useSubscriptionStore";

export const useAddSubscription = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addSubscription, isLoading } = useSubscriptionStore();

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSave = async () => {
    if (!name || !cost || !dueDate) {
      Toast.show({ type: "error", text1: "Mohon Lengkapi Data" });
      return;
    }

    const dateNum = parseInt(dueDate);
    if (isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
      Toast.show({
        type: "error",
        text1: "Tanggal tidak valid",
        text2: "Masukkan tanggal 1-31",
      });
      return;
    }

    try {
      await addSubscription(user!.uid, {
        name,
        cost: parseFloat(cost),
        dueDate: dateNum,
      });
      Toast.show({ type: "success", text1: "Langganan Disimpan" });
      router.back();
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    }
  };

  const onClose = () => {
    router.back();
  };

  return {
    name,
    setName,
    cost,
    setCost,
    dueDate,
    setDueDate,
    isLoading,
    handleSave,
    onClose,
  };
};
