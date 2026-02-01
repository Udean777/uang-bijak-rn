import { cn } from "@/src/utils/cn";
import React, { useEffect } from "react";
import { DimensionValue, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SKELETON_VARIANTS, SkeletonVariant } from "./config/variants";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  variant?: SkeletonVariant;
  className?: string;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = "box",
  className,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width, height }, style, animatedStyle]}
      className={cn("bg-gray-300", SKELETON_VARIANTS[variant], className)}
    />
  );
};
