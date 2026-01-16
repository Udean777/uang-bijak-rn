import { AppText } from "@/src/components/atoms/AppText";
import { View } from "react-native";

export default function HistoryScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <AppText variant="h3" weight="bold">
        Halaman Riwayat Transaksi
      </AppText>
    </View>
  );
}
