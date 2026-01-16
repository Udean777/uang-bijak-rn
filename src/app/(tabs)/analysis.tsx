import { AppText } from "@/src/components/atoms/AppText";
import { View } from "react-native";

export default function AnalysisScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <AppText variant="h3" weight="bold">
        Halaman Analisa (Needs vs Wants)
      </AppText>
    </View>
  );
}
