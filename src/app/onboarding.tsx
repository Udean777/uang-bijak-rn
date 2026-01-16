import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Kelola Keuangan Cerdas",
    description:
      "Catat setiap pemasukan dan pengeluaranmu dengan mudah. Ketahui kemana perginya uangmu setiap bulan.",
    icon: "pie-chart",
    color: "#3B82F6",
  },
  {
    id: "2",
    title: "Multi Dompet & Akun",
    description:
      "Pisahkan uang tunai, bank, dan e-wallet dalam satu aplikasi. Pantau total kekayaanmu secara realtime.",
    icon: "wallet",
    color: "#10B981",
  },
  {
    id: "3",
    title: "Analisa & Budgeting",
    description:
      "Dapatkan wawasan visual tentang kebiasaan belanjamu dan atur budget harian agar tidak boros.",
    icon: "trending-up",
    color: "#F59E0B",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = async () => {
    try {
      await setHasSeenOnboarding(true);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Gagal menyimpan status onboarding", error);
      router.replace("/(auth)/login");
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const renderItem = ({ item }: { item: (typeof SLIDES)[0] }) => {
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
          <Ionicons name={item.icon as any} size={120} color={item.color} />
        </View>

        <AppText variant="h1" weight="bold" className="text-center mb-4">
          {item.title}
        </AppText>

        <AppText
          color="secondary"
          className="text-center text-lg leading-7 px-4"
        >
          {item.description}
        </AppText>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="mt-12 px-6 items-end">
        <TouchableOpacity onPress={handleFinish}>
          <AppText weight="bold" color="primary">
            Lewati
          </AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View className="px-6 pb-12">
        <View className="flex-row justify-center gap-2 mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? "w-8" : "w-2"
              }`}
              style={{
                backgroundColor:
                  currentIndex === index ? "#3B82F6" : theme.border,
              }}
            />
          ))}
        </View>

        <AppButton
          title={
            currentIndex === SLIDES.length - 1 ? "Mulai Sekarang" : "Lanjut"
          }
          onPress={handleNext}
          className="w-full py-4 rounded-2xl"
        />
      </View>
    </View>
  );
}
