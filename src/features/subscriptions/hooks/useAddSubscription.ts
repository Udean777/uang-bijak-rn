import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
import { Subscription } from "@/src/types/subscription";
import { getErrorMessage } from "@/src/utils/errorUtils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useSubscriptionStore } from "../store/useSubscriptionStore";

export const useAddSubscription = (
  editingSubscription?: Subscription | null,
) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addSubscription, updateSubscription, isLoading } =
    useSubscriptionStore();

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setCost(editingSubscription.cost.toLocaleString("id-ID"));
      setDueDate(editingSubscription.dueDate.toString());
    } else {
      setName("");
      setCost("");
      setDueDate("");
    }
  }, [editingSubscription]);

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
      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, {
          name,
          cost: parseCurrency(cost),
          dueDate: dateNum,
        });
        Toast.show({ type: "success", text1: "Langganan Diperbarui" });
      } else {
        await addSubscription(user!.uid, {
          name,
          cost: parseCurrency(cost),
          dueDate: dateNum,
        });
        Toast.show({ type: "success", text1: "Langganan Disimpan" });
      }
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: getErrorMessage(error),
      });
      throw error;
    }
  };

  const onClose = () => {
    // router.back();
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
