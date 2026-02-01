import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { Debt } from "@/src/types/debt";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface DebtItemProps {
  item: Debt;
  onShareReminder: (item: Debt) => void;
  onMarkPaid: (item: Debt) => void;
  onDelete: (id: string) => void;
  formatRupiah: (val: number) => string;
}

export const DebtItem = ({
  item,
  onShareReminder,
  onMarkPaid,
  onDelete,
  formatRupiah,
}: DebtItemProps) => {
  const { colors: theme, isDark } = useTheme();
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
              onPress={() => onShareReminder(item)}
              className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-lg"
              style={{
                backgroundColor: isDark ? "rgba(37, 99, 235, 0.2)" : "#EFF6FF",
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
            onPress={() => onMarkPaid(item)}
            className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-lg"
            style={{
              backgroundColor: isDark ? "rgba(22, 163, 74, 0.2)" : "#F0FDF4",
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
            onPress={() => onDelete(item.id)}
            className="w-10 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      )}

      {isPaid && (
        <View className="flex-row justify-end mt-2">
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <AppText variant="caption" color="error">
              Hapus Riwayat
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
