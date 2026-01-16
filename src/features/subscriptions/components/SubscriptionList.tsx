import { AppCard } from "@/src/components/atoms/AppCard";
import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { SubscriptionService } from "@/src/services/subscriptionService";
import { Subscription } from "@/src/types/subscription";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export const SubscriptionList = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = SubscriptionService.subscribeSubscriptions(
      user.uid,
      (data) => {
        setSubs(data);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Hapus Langganan?", `Yakin ingin menghapus ${name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => SubscriptionService.deleteSubscription(id),
      },
    ]);
  };

  if (loading)
    return <Skeleton variant="box" height={100} className="w-full" />;

  const totalCost = subs.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <View>
      <View className="bg-indigo-600 p-5 rounded-2xl mb-4 flex-row justify-between items-center">
        <View>
          <AppText variant="caption" color="white" className="opacity-80">
            Total Tagihan Bulanan
          </AppText>
          <AppText variant="h2" weight="bold" color="white">
            {formatRupiah(totalCost)}
          </AppText>
        </View>
        <View className="bg-white/20 p-2 rounded-lg">
          <Ionicons name="calendar" size={24} color="white" />
        </View>
      </View>

      {subs.length === 0 ? (
        <AppText color="secondary" className="text-center py-4">
          Belum ada langganan aktif.
        </AppText>
      ) : (
        subs.map((item) => (
          <AppCard
            key={item.id}
            className="mb-3 flex-row justify-between items-center"
            onLongPress={() => handleDelete(item.id, item.name)}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <AppText weight="bold" className="text-gray-500">
                  {item.name.charAt(0)}
                </AppText>
              </View>
              <View>
                <AppText weight="bold">{item.name}</AppText>
                <AppText variant="caption" color="secondary">
                  Tgl {item.dueDate} setiap bulan
                </AppText>
              </View>
            </View>
            <AppText weight="bold" color="primary">
              {formatRupiah(item.cost)}
            </AppText>
          </AppCard>
        ))
      )}
    </View>
  );
};
