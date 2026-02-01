import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList } from "react-native";

const { width } = Dimensions.get("window");

export const SLIDES = [
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

export const useOnboardingScreen = () => {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuthStore();
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

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return {
    currentIndex,
    flatListRef,
    handleFinish,
    handleNext,
    onMomentumScrollEnd,
    isLastSlide,
    slides: SLIDES,
    width,
  };
};
