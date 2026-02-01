import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { DebtService } from "@/src/services/debtService";
import { Debt, DebtType } from "@/src/types/debt";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Share } from "react-native";
import { useDebtStore } from "../store/useDebtStore";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export const useDebtsScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateStatus, deleteDebt, setDebts } = useDebtStore();

  const [debts, setLocalDebts] = useState<Debt[]>([]);
  const [filter, setFilter] = useState<DebtType>("receivable");
  const [showAdd, setShowAdd] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "primary" as "primary" | "danger",
    confirmText: "Ya, Lanjutkan",
  });

  useEffect(() => {
    if (!user) return;
    const unsub = DebtService.subscribeDebts(user.uid, (data) => {
      setLocalDebts(data);
      setDebts(data);
    });
    return () => unsub();
  }, [user]);

  const filteredData = useMemo(
    () => debts.filter((d) => d.type === filter),
    [debts, filter],
  );

  const totalAmount = useMemo(
    () =>
      filteredData
        .filter((d) => d.status === "unpaid")
        .reduce((sum, d) => sum + d.amount, 0),
    [filteredData],
  );

  const handleShareReminder = async (item: Debt) => {
    const dueDate = new Date(item.dueDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
    });
    const message = `Halo ${item.personName}, semoga sehat selalu ya! 😊\n\nSekadar mengingatkan mengenai pinjaman sebesar ${formatRupiah(item.amount)} yang jatuh tempo tanggal ${dueDate}.\n\nJika sudah ada rezeki, mohon dikabari ya. Terima kasih banyak! 🙏`;

    try {
      await Share.share({ message });
    } catch (error) {
      // ignore
    }
  };

  const handleMarkPaid = (item: Debt) => {
    setConfirmConfig({
      title: "Konfirmasi Lunas",
      message: `Apakah ${item.personName} sudah melunasi?`,
      confirmText: "Ya, Lunas",
      variant: "primary",
      onConfirm: async () => {
        await updateStatus(item.id, "paid");
        setConfirmVisible(false);
      },
    });
    setConfirmVisible(true);
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      title: "Hapus Data",
      message: "Yakin hapus data ini?",
      confirmText: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        await deleteDebt(id);
        setConfirmVisible(false);
      },
    });
    setConfirmVisible(true);
  };

  const handleBack = () => router.back();

  return {
    debts,
    filter,
    setFilter,
    filteredData,
    totalAmount,
    showAdd,
    setShowAdd,
    confirmVisible,
    setConfirmVisible,
    confirmConfig,
    handleShareReminder,
    handleMarkPaid,
    handleDelete,
    handleBack,
    formatRupiah,
  };
};
