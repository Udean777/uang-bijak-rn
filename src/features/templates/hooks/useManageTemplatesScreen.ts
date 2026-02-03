import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useWalletStore } from "@/src/features/wallets/store/useWalletStore";
import { parseCurrency } from "@/src/hooks/useCurrencyFormat";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useTemplateStore } from "../store/useTemplateStore";

interface FormState {
  name: string;
  amount: string;
  category: string;
  walletId: string;
}

export const useManageTemplatesScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallets } = useWalletStore();
  const {
    templates,
    isLoading,
    addTemplate,
    deleteTemplate,
    initializeTemplates,
  } = useTemplateStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    amount: "",
    category: "Makan",
    walletId: "",
  });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  // Subscribe to templates
  useEffect(() => {
    if (user) {
      const unsub = initializeTemplates(user.uid);
      return () => unsub();
    }
  }, [user]);

  // Auto-select first wallet
  useEffect(() => {
    if (wallets.length > 0 && !form.walletId) {
      setForm((prev) => ({ ...prev, walletId: wallets[0].id }));
    }
  }, [wallets, form.walletId]);

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      amount: "",
      category: "Makan",
      walletId: wallets[0]?.id || "",
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.amount || !form.walletId) {
      Toast.show({ type: "error", text1: "Data tidak lengkap" });
      return;
    }

    await addTemplate({
      userId: user!.uid,
      name: form.name,
      amount: parseCurrency(form.amount),
      type: "expense",
      category: form.category,
      walletId: form.walletId,
      icon: "flash",
    });

    Toast.show({ type: "success", text1: "Shortcut dibuat!" });
    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      title: "Hapus Shortcut",
      message: "Yakin ingin menghapus shortcut ini?",
      confirmText: "Hapus",
      onConfirm: async () => {
        await deleteTemplate(id);
        setConfirmVisible(false);
      },
    });
    setConfirmVisible(true);
  };

  const handleBack = () => router.back();

  return {
    templates,
    isLoading,
    wallets,
    isModalVisible,
    setModalVisible,
    form,
    updateForm,
    confirmVisible,
    setConfirmVisible,
    confirmConfig,
    handleSave,
    handleDelete,
    handleBack,
  };
};
