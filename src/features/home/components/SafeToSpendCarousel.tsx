import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { WalletSafeToSpend } from "@/src/features/home/hooks/useHomeData";
import { useTheme } from "@/src/hooks/useTheme";
import React, { memo, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { CAROUSEL_CONFIG, STATUS_COLORS } from "../constants/safeToSpend";
import { useCarouselGesture } from "../hooks/useCarouselGesture";
import { useSafeToSpendStore } from "../store/useSafeToSpendStore";
import { SafeToSpendCardItem } from "./SafeToSpendCardItem";
import { SafeToSpendInfoModal } from "./SafeToSpendInfoModal";

interface SafeToSpendCarouselProps {
  isLoading: boolean;
  wallets: WalletSafeToSpend[];
}

export const SafeToSpendCarousel = memo(
  ({ isLoading, wallets }: SafeToSpendCarouselProps) => {
    const { colors, isDark } = useTheme();
    const { activeIndex, setActiveIndex, openInfoModal, reset } =
      useSafeToSpendStore();
    const { gesture, translateX } = useCarouselGesture(wallets.length - 1);

    // Reset carousel when wallets change
    useEffect(() => {
      reset();
    }, [wallets.length, reset]);

    if (isLoading) {
      return (
        <Skeleton
          variant="box"
          width="100%"
          height={150}
          className="rounded-2xl"
        />
      );
    }

    if (wallets.length === 0) {
      return (
        <View
          className="p-5 rounded-3xl"
          style={{ backgroundColor: colors.surface }}
        >
          <AppText className="text-center opacity-60">
            Belum ada kantong untuk ditampilkan
          </AppText>
        </View>
      );
    }

    const currentWallet = wallets[activeIndex];

    return (
      <>
        <GestureDetector gesture={gesture}>
          <View className="overflow-hidden">
            {/* Stack Cards */}
            <View style={{ height: CAROUSEL_CONFIG.cardHeight }}>
              {wallets.map((wallet, index) => (
                <SafeToSpendCardItem
                  key={wallet.walletId}
                  wallet={wallet}
                  isActive={index === activeIndex}
                  offset={index - activeIndex}
                  translateX={translateX}
                  onInfoPress={openInfoModal}
                />
              ))}
            </View>

            {/* Dots Indicator */}
            {wallets.length > 1 && (
              <DotsIndicator
                count={wallets.length}
                activeIndex={activeIndex}
                activeColor={STATUS_COLORS[currentWallet.status]}
                isDark={isDark}
                onDotPress={setActiveIndex}
              />
            )}
          </View>
        </GestureDetector>

        <SafeToSpendInfoModal
          walletName={currentWallet.walletName}
          status={currentWallet.status}
        />
      </>
    );
  },
);

SafeToSpendCarousel.displayName = "SafeToSpendCarousel";

// Dots Indicator sub-component
interface DotsIndicatorProps {
  count: number;
  activeIndex: number;
  activeColor: string;
  isDark: boolean;
  onDotPress: (index: number) => void;
}

const DotsIndicator = memo(
  ({
    count,
    activeIndex,
    activeColor,
    isDark,
    onDotPress,
  }: DotsIndicatorProps) => (
    <View className="flex-row justify-center items-center mt-4 gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <TouchableOpacity key={index} onPress={() => onDotPress(index)}>
          <View
            className="rounded-full"
            style={{
              width: index === activeIndex ? 24 : 8,
              height: 8,
              backgroundColor:
                index === activeIndex ? activeColor : isDark ? "#444" : "#DDD",
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  ),
);

DotsIndicator.displayName = "DotsIndicator";
