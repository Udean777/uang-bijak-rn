import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue, withSpring } from "react-native-reanimated";
import { CAROUSEL_CONFIG } from "../constants/safeToSpend";
import { useSafeToSpendStore } from "../store/useSafeToSpendStore";

export const useCarouselGesture = (maxIndex: number) => {
  const translateX = useSharedValue(0);
  const { goNext, goPrev } = useSafeToSpendStore();

  const handleSwipeLeft = useCallback(() => {
    goNext(maxIndex);
  }, [goNext, maxIndex]);

  const handleSwipeRight = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -CAROUSEL_CONFIG.swipeThreshold) {
        runOnJS(handleSwipeLeft)();
      } else if (e.translationX > CAROUSEL_CONFIG.swipeThreshold) {
        runOnJS(handleSwipeRight)();
      }
      translateX.value = withSpring(0, CAROUSEL_CONFIG.springConfig);
    });

  return { gesture, translateX };
};
