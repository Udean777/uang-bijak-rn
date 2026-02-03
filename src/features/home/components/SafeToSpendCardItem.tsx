import { AppText } from "@/src/components/atoms/AppText";
import { WalletSafeToSpend } from "@/src/features/home/hooks/useHomeData";
import { useTheme } from "@/src/hooks/useTheme";
import { formatRupiah } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { STATUS_COLORS, STATUS_ICONS } from "../constants/safeToSpend";
import { InfoModalType } from "../store/useSafeToSpendStore";

interface SafeToSpendCardItemProps {
  wallet: WalletSafeToSpend;
  isActive: boolean;
  offset: number;
  translateX: { value: number };
  onInfoPress: (type: InfoModalType) => void;
}

export const SafeToSpendCardItem = memo(
  ({
    wallet,
    isActive,
    offset,
    translateX,
    onInfoPress,
  }: SafeToSpendCardItemProps) => {
    const { isDark } = useTheme();

    const animatedStyle = useAnimatedStyle(() => {
      const absOffset = Math.abs(offset);
      const scale = interpolate(absOffset, [0, 1, 2], [1, 0.92, 0.85]);
      const transY = interpolate(absOffset, [0, 1, 2], [0, 10, 20]);
      const opacity = interpolate(absOffset, [0, 1, 2], [1, 0.7, 0.4]);
      const dragX = isActive ? translateX.value * 0.3 : 0;

      return {
        transform: [{ translateX: dragX }, { scale }, { translateY: transY }],
        opacity,
        zIndex: 10 - absOffset,
      };
    });

    // Performance: only render nearby cards
    if (Math.abs(offset) > 2) return null;

    const statusColor = STATUS_COLORS[wallet.status];
    const statusIcon = STATUS_ICONS[
      wallet.status
    ] as keyof typeof Ionicons.glyphMap;

    return (
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            backgroundColor: statusColor,
            borderRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 10,
            elevation: 5,
          },
          animatedStyle,
        ]}
      >
        {/* Wallet Badge */}
        <View className="absolute top-3 right-3 bg-white/20 px-3 py-1 rounded-full border border-white/10">
          <AppText variant="caption" weight="bold" color="white">
            {wallet.walletName}
          </AppText>
        </View>

        {/* Safe-to-Spend Section */}
        <View className="mb-2">
          <TouchableOpacity
            onPress={() => onInfoPress("safeToSpend")}
            className="flex-row items-center gap-1 mb-1"
          >
            <AppText variant="label" color="white" style={{ opacity: 0.8 }}>
              Safe-to-Spend (Harian)
            </AppText>
            <Ionicons
              name="help-circle-outline"
              size={16}
              color="white"
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
          <AppText
            variant="h1"
            weight="bold"
            color="white"
            className="text-4xl"
          >
            {formatRupiah(wallet.safeDaily)}
          </AppText>
        </View>

        <View className="h-[1px] bg-white/20 w-full my-3" />

        {/* Bottom Section */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => onInfoPress("balance")}>
            <View className="flex-row items-center gap-1">
              <AppText variant="caption" color="white" style={{ opacity: 0.7 }}>
                Saldo Kantong
              </AppText>
              <Ionicons
                name="help-circle-outline"
                size={14}
                color="white"
                style={{ opacity: 0.7 }}
              />
            </View>
            <AppText variant="body" weight="bold" color="white">
              {formatRupiah(wallet.balance)}
            </AppText>
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <View className="bg-white/20 px-2 py-1 rounded-full">
              <AppText variant="caption" color="white">
                {wallet.remainingDays} Hari
              </AppText>
            </View>
            <TouchableOpacity onPress={() => onInfoPress("status")}>
              <Ionicons
                name={statusIcon}
                size={28}
                color="white"
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  },
);

SafeToSpendCardItem.displayName = "SafeToSpendCardItem";
