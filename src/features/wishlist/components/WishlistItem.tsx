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

  const isPurchased = item.status === "purchased";
  const isReady = item.status === "ready" || Date.now() >= item.targetDate;
  const progress = isPurchased
    ? 1
    : getProgress(item.createdAt, item.targetDate);

  return (
    <View
      className="p-4 rounded-2xl mb-4 border shadow-sm"
      style={{
        backgroundColor: isPurchased
          ? isDark
            ? "#1a1a1a"
            : "#f5f5f5"
          : theme.card,
        borderColor: isPurchased ? theme.border : theme.border,
        shadowOpacity: isDark ? 0.2 : 0.1,
        opacity: isPurchased ? 0.7 : 1,
      }}
    >
      <View className="flex-row justify-between mb-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <AppText
              weight="bold"
              className="text-lg"
              style={{
                textDecorationLine: isPurchased ? "line-through" : "none",
                opacity: isPurchased ? 0.6 : 1,
              }}
            >
              {item.name}
            </AppText>
            {isPurchased && (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: theme.success + "20" }}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={{ color: theme.success }}
                >
                  Dibeli
                </AppText>
              </View>
            )}
          </View>
          <AppText weight="bold" style={{ opacity: isPurchased ? 0.6 : 1 }}>
            {formatRupiah(item.price)}
          </AppText>
        </View>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {/* Show purchased state */}
      {isPurchased ? (
        <View
          className="mt-2 p-3 rounded-xl flex-row items-center justify-between"
          style={{
            backgroundColor: isDark ? "rgba(22, 163, 74, 0.1)" : "#F0FDF4",
          }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <AppText
              variant="caption"
              weight="bold"
              style={{ color: theme.success }}
            >
              Sudah dibeli - Selamat! 🎉
            </AppText>
          </View>
        </View>
      ) : (
        <>
          {/* Progress bar for non-purchased items */}
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
                {isReady
                  ? "Siap Diputuskan"
                  : getRemainingTime(item.targetDate)}
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

          {/* Action section */}
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
                variant="primary"
                className="flex-1"
                style={{
                  backgroundColor: theme.success,
                  borderColor: theme.success,
                }}
                onPress={() => onPurchase(item)}
              />
            </View>
          ) : (
            <View
              className="flex-row gap-2 items-center p-2 rounded-lg"
              style={{ backgroundColor: theme.surface }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={theme.icon}
              />
              <AppText variant="caption" className="italic">
                Tahan keinginanmu selama {item.durationDays} hari.
              </AppText>
            </View>
          )}
        </>
      )}
    </View>
  );
};
