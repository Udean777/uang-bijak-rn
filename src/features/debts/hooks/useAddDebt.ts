import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { DebtType } from "@/src/types/debt";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useDebtStore } from "../store/useDebtStore";

export const useAddDebt = (onClose: () => void) => {
  const { user } = useAuth();
  const { addDebt } = useDebtStore();

  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<DebtType>("receivable");
  const [dueDate, setDueDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDate = (date: Date) => {
    setDueDate(date);
    setDatePickerVisibility(false);
  };

  const handleSave = async () => {
    if (!personName || !amount) {
      Toast.show({ type: "error", text1: "Mohon lengkapi nama & nominal" });
      return;
    }
    setIsLoading(true);
    try {
      await addDebt(user!.uid, {
        personName,
        amount: parseFloat(amount),
        type,
        dueDate: dueDate.getTime(),
        note: "",
      });
      Toast.show({ type: "success", text1: "Data tersimpan" });

      setPersonName("");
      setAmount("");
      setType("receivable");
      setDueDate(new Date());
      onClose();
    } catch (e) {
      Toast.show({ type: "error", text1: "Gagal menyimpan" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    personName,
    setPersonName,
    amount,
    setAmount,
    type,
    setType,
    dueDate,
    isDatePickerVisible,
    setDatePickerVisibility,
    isLoading,
    handleConfirmDate,
    handleSave,
  };
};
