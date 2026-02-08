import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { useOnboardingScreen } from "@/src/features/auth/hooks/useOnboardingScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

interface SlideItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface SlideItemProps {
  item: SlideItem;
  width: number;
}

const OnboardingSlide = ({ item, width }: SlideItemProps) => {
  const { isDark } = useTheme();

  return (
    <View style={{ width }} className="items-center justify-center px-8">
      <View
        className="w-64 h-64 rounded-full items-center justify-center mb-10 shadow-lg"
        style={{
          backgroundColor: isDark ? `${item.color}30` : `${item.color}20`,
          shadowColor: item.color,
          shadowOpacity: 0.3,
        }}
      >
        <Ionicons
          name={item.icon as keyof typeof Ionicons.glyphMap}
          size={120}
          color={item.color}
        />
      </View>

      <AppText variant="h1" weight="bold" className="text-center mb-4">
        {item.title}
      </AppText>

      <AppText className="text-center text-lg leading-7 px-4">
        {item.description}
      </AppText>
    </View>
  );
};

interface PaginationProps {
  slides: SlideItem[];
  currentIndex: number;
}

const Pagination = ({ slides, currentIndex }: PaginationProps) => {
  const { colors } = useTheme();

  return (
    <View className="flex-row justify-center gap-2 mb-8">
      {slides.map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            currentIndex === index ? "w-8" : "w-2"
          }`}
          style={{
            backgroundColor:
              currentIndex === index ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
};

export default function OnboardingScreen() {
  const { colors } = useTheme();

  const {
    currentIndex,
    flatListRef,
    handleFinish,
    handleNext,
    onMomentumScrollEnd,
    isLastSlide,
    slides,
    width,
  } = useOnboardingScreen();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-6 items-end mt-4">
        <TouchableOpacity onPress={handleFinish}>
          <AppText weight="bold">Lewati</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <OnboardingSlide item={item} width={width} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />

      <View className="px-6 pb-12">
        <Pagination slides={slides} currentIndex={currentIndex} />

        <AppButton
          title={isLastSlide ? "Mulai Sekarang" : "Lanjut"}
          onPress={handleNext}
          className="w-full py-4 rounded-2xl"
        />
      </View>
    </View>
  );
}
