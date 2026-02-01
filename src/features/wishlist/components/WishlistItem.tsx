import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import {
  formatRupiah,
  getProgress,
  getRemainingTime,
} from "@/src/features/wishlist/hooks/useWishlistScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Wishlist } from "@/src/types/wishlist";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface WishlistItemProps {
  item: Wishlist;
  onPurchase: (item: Wishlist) => void;
  onDelete: (id: string) => void;
}

export const WishlistItem = ({
  item,
  onPurchase,
  onDelete,
}: WishlistItemProps) => {
  const { colors: theme, isDark } = useTheme();

  if (item.status === "purchased") return null;

  const isReady = item.status === "ready" || Date.now() >= item.targetDate;
  const progress = getProgress(item.createdAt, item.targetDate);

  return (
    <View
      className="p-4 rounded-2xl mb-4 border shadow-sm"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowOpacity: isDark ? 0.2 : 0.1,
      }}
    >
      <View className="flex-row justify-between mb-2">
        <View className="flex-1">
          <AppText weight="bold" className="text-lg">
            {item.name}
          </AppText>
          <AppText weight="bold">{formatRupiah(item.price)}</AppText>
        </View>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>

      <View className="my-3">
        <View className="flex-row justify-between mb-1">
          <AppText variant="caption">
            {isReady ? "Cooling-off Selesai!" : "Menunggu..."}
          </AppText>
          <AppText
            variant="caption"
            weight="bold"
            style={{ color: isReady ? theme.success : theme.info }}
          >
            {isReady ? "Siap Diputuskan" : getRemainingTime(item.targetDate)}
          </AppText>
        </View>

        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.surface }}
        >
          <View
            className="h-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: isReady ? theme.success : theme.info,
            }}
          />
        </View>
      </View>

      {isReady ? (
        <View
          className="mt-2 p-3 rounded-xl"
          style={{
            backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "#F0FDF4",
          }}
        >
          <AppText
            variant="caption"
            className="text-center mb-2 font-medium"
            style={{ color: theme.success }}
          >
            Waktu berpikir habis! Masih ingin barang ini?
          </AppText>
          <AppButton
            title="Ya, Beli Sekarang"
            onPress={() => onPurchase(item)}
            variant="primary"
            style={{
              backgroundColor: theme.success,
              borderColor: theme.success,
            }}
            className="h-10"
          />
        </View>
      ) : (
        <View
          className="flex-row gap-2 items-center p-2 rounded-lg"
          style={{ backgroundColor: theme.surface }}
        >
          <Ionicons name="lock-closed-outline" size={14} color={theme.icon} />
          <AppText variant="caption" className="italic">
            Tahan keinginanmu selama {item.durationDays} hari.
          </AppText>
        </View>
      )}
    </View>
  );
};
