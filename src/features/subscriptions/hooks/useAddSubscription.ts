import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
import { Subscription } from "@/src/types/subscription";
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
      // router.back(); // Sheet is controlled by parent state, no need to route back usually, but if modal page then yes.
      // In menu.tsx context, it's a generic functions. However, checking usages, it's closed via callback.
      // So we don't route back? Wait, the original code had router.back()
      // But menu.tsx opens it as a custom sheet component via state?
      // "AddSubscriptionSheet" is a Modal.
      // If used in MenuScreen, router.back() might not be correct if it wasn't pushed?
      // Ah, the original code used router.back() in handleSave?
      // Yes. Wait, if it's a Modal inside MenuScreen, router.back() would go back from MenuScreen?
      // Unless AddSubscriptionSheet IS navigating to a modal route?
      // Original code `useAddSubscription` imports useRouter.
      // But `AddSubscriptionSheet` in `menu.tsx` is just a component.
      // If `handleSave` calls `router.back()`, it might be bugs if it's not a route.
      // Let's check `menu.tsx` again. usage: `<AddSubscriptionSheet ... />`
      // It IS rendered inline.
      // So `router.back()` in `useAddSubscription` is probably WRONG for `menu.tsx` usage, unless I missed something (e.g. earlier it was a separate route).
      // Or maybe `AddSubscriptionSheet` is also used as a meaningful modal route?
      // But `menu.tsx` controls visibility with `showAddSheet`.
      // I should probably REMOVE `router.back()` and let the caller handle closing.
      // The `AddSubscriptionSheet` component has `onClose`.
      // I will return a boolean or let the component handle closure.
      // Better: `handleSave` just saves. The component calls `onClose` after success.
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
      throw error; // Rethrow to let component handle close
    }
  };

  const onClose = () => {
    // router.back(); // Remove this specific behavior
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
