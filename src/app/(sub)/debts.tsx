import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { AddDebtSheet } from "@/src/features/debts/components/AddDebtSheet";
import { DebtItem } from "@/src/features/debts/components/DebtItem";
import { useDebtsScreen } from "@/src/features/debts/hooks/useDebtsScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function DebtScreen() {
  const { colors: theme, isDark } = useTheme();

  const {
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
  } = useDebtsScreen();

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
          <TouchableOpacity onPress={handleBack}>
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
        renderItem={({ item }) => (
          <DebtItem
            item={item}
            onShareReminder={handleShareReminder}
            onMarkPaid={handleMarkPaid}
            onDelete={handleDelete}
            formatRupiah={formatRupiah}
          />
        )}
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
