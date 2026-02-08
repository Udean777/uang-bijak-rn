import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
import { DebtType } from "@/src/types/debt";
import { getErrorMessage } from "@/src/utils/errorUtils";
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
        amount: parseCurrency(amount),
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
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Gagal Menyimpan",
        text2: getErrorMessage(error),
      });
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
