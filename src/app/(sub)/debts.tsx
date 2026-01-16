import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AddDebtSheet } from "@/src/features/debts/components/AddDebtSheet";
import { DebtService } from "@/src/services/debtService";
import { Debt, DebtType } from "@/src/types/debt";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Share, TouchableOpacity, View } from "react-native";

export default function DebtScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [debts, setDebts] = useState<Debt[]>([]);
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
    const unsub = DebtService.subscribeDebts(user.uid, setDebts);
    return () => unsub();
  }, [user]);

  const filteredData = debts.filter((d) => d.type === filter);

  const totalAmount = filteredData
    .filter((d) => d.status === "unpaid")
    .reduce((sum, d) => sum + d.amount, 0);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

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
        await DebtService.updateStatus(item.id, "paid");
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
        await DebtService.deleteDebt(id);
        setConfirmVisible(false);
      },
    });
    setConfirmVisible(true);
  };

  const renderItem = ({ item }: { item: Debt }) => {
    const isPaid = item.status === "paid";
    const isOverdue = !isPaid && Date.now() > item.dueDate;

    return (
      <View
        className="p-4 rounded-2xl mb-3 border"
        style={{
          backgroundColor: isPaid ? theme.background : theme.card,
          borderColor: theme.border,
          opacity: isPaid ? 0.6 : 1,
        }}
      >
        <View className="flex-row justify-between mb-2">
          <View>
            <View className="flex-row items-center gap-2">
              <AppText weight="bold" className="text-lg">
                {item.personName}
              </AppText>
              {isPaid && (
                <View
                  className="px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(22, 163, 74, 0.2)"
                      : "#DCFCE7",
                  }}
                >
                  <AppText
                    className="text-xs font-bold"
                    style={{ color: isDark ? "#4ADE80" : "#15803D" }}
                  >
                    LUNAS
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="caption">
              Jatuh Tempo:{" "}
              {new Date(item.dueDate).toLocaleDateString("id-ID", {
                dateStyle: "medium",
              })}
            </AppText>
            {isOverdue && (
              <AppText
                variant="caption"
                className="font-bold mt-1"
                style={{ color: theme.danger }}
              >
                ⚠️ Terlewat Jatuh Tempo
              </AppText>
            )}
          </View>
          <AppText weight="bold" className="text-lg">
            {formatRupiah(item.amount)}
          </AppText>
        </View>

        {!isPaid && (
          <View
            className="flex-row gap-3 mt-3 pt-3 border-t"
            style={{ borderColor: theme.border }}
          >
            {item.type === "receivable" && (
              <TouchableOpacity
                onPress={() => handleShareReminder(item)}
                className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-lg"
                style={{
                  backgroundColor: isDark
                    ? "rgba(37, 99, 235, 0.2)"
                    : "#EFF6FF", // blue-50
                }}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={16}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <AppText
                  variant="caption"
                  weight="bold"
                  style={{ color: isDark ? "#60A5FA" : "#2563EB" }}
                >
                  Ingatkan
                </AppText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleMarkPaid(item)}
              className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-lg"
              style={{
                backgroundColor: isDark ? "rgba(22, 163, 74, 0.2)" : "#F0FDF4", // green-50
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={isDark ? "#4ADE80" : "#16A34A"}
              />
              <AppText
                variant="caption"
                weight="bold"
                style={{ color: isDark ? "#4ADE80" : "#16A34A" }}
              >
                Tandai Lunas
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              className="w-10 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        )}

        {isPaid && (
          <View className="flex-row justify-end mt-2">
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <AppText variant="caption" color="error">
                Hapus Riwayat
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
        }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <AppText variant="h3" weight="bold">
            Catatan Hutang
          </AppText>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)}>
          <AppText weight="bold">+ Catat</AppText>
        </TouchableOpacity>
      </View>

      <View
        className="flex-row p-2 mx-5 mt-4 rounded-xl mb-4"
        style={{ backgroundColor: theme.surface }}
      >
        <TouchableOpacity
          onPress={() => setFilter("receivable")}
          className="flex-1 py-2 items-center rounded-lg"
          style={
            filter === "receivable"
              ? {
                  backgroundColor: isDark
                    ? "rgba(22, 163, 74, 0.2)"
                    : "#F0FDF4",
                  borderColor: "#16A34A",
                  borderWidth: 1,
                }
              : {}
          }
        >
          <AppText
            weight={filter === "receivable" ? "bold" : "medium"}
            style={{
              color:
                filter === "receivable"
                  ? "#16A34A"
                  : isDark
                    ? "white"
                    : undefined,
            }}
            color={filter === "receivable" || isDark ? undefined : "secondary"}
          >
            Dipinjam Orang
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("payable")}
          className="flex-1 py-2 items-center rounded-lg"
          style={
            filter === "payable"
              ? {
                  backgroundColor: isDark
                    ? "rgba(220, 38, 38, 0.2)"
                    : "#FEF2F2",
                  borderColor: "#DC2626",
                  borderWidth: 1,
                }
              : {}
          }
        >
          <AppText
            weight={filter === "payable" ? "bold" : "medium"}
            style={{
              color:
                filter === "payable" ? "#DC2626" : isDark ? "white" : undefined,
            }}
            color={filter === "payable" || isDark ? undefined : "secondary"}
          >
            Saya Hutang
          </AppText>
        </TouchableOpacity>
      </View>

      <View
        className="mx-5 mb-4 p-4 rounded-xl shadow-md"
        style={{
          backgroundColor: filter === "receivable" ? "#16A34A" : "#DC2626",
        }}
      >
        <AppText
          weight="bold"
          variant="caption"
          className="uppercase mb-1"
          style={{ opacity: 0.8, color: "white" }}
        >
          Total Belum Lunas (
          {filter === "receivable" ? "Akan Diterima" : "Harus Dibayar"})
        </AppText>
        <AppText variant="h2" weight="bold" style={{ color: "white" }}>
          {formatRupiah(totalAmount)}
        </AppText>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          <EmptyState
            title="Bersih!"
            message={
              filter === "receivable"
                ? "Tidak ada orang yang berhutang padamu saat ini."
                : "Kamu bebas hutang! Pertahankan."
            }
            icon={
              filter === "receivable" ? "happy-outline" : "thumbs-up-outline"
            }
            className="mt-10"
          />
        }
      />

      <AddDebtSheet visible={showAdd} onClose={() => setShowAdd(false)} />

      <ConfirmDialog
        visible={confirmVisible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmVisible(false)}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
      />
    </View>
  );
}
