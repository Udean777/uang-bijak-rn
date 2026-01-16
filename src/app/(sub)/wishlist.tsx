import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AddWishlistSheet } from "@/src/features/wishlist/components/AddWishlistSheet";
import { WishlistService } from "@/src/services/wishlistService";
import { Wishlist } from "@/src/types/wishlist";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "primary" as "primary" | "danger",
    confirmText: "Ya, Lanjutkan",
  });

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (!user) return;
    const unsub = WishlistService.subscribeWishlists(user.uid, setWishlists);
    return () => unsub();
  }, [user]);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const getRemainingTime = (targetDate: number) => {
    const diff = targetDate - Date.now();
    if (diff <= 0) return "Waktu Habis";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} Hari Lagi`;
  };

  const getProgress = (created: number, target: number) => {
    const total = target - created;
    const elapsed = Date.now() - created;
    const progress = elapsed / total;
    return Math.min(Math.max(progress, 0), 1);
  };

  const handlePurchase = (item: Wishlist) => {
    setConfirmConfig({
      title: "Konfirmasi Pembelian",
      message:
        "Hebat! Kamu sudah menunggu dengan sabar. Apakah kamu yakin ingin membeli ini sekarang?",
      confirmText: "Ya, Beli & Catat",
      variant: "primary",
      onConfirm: () => {
        WishlistService.updateStatus(item.id, "purchased");
        setConfirmVisible(false);
        router.push({
          pathname: "/(modals)/add-transaction",
          params: {
            editData: JSON.stringify({
              amount: item.price,
              category: "Belanja",
              note: `Pembelian Wishlist: ${item.name}`,
              type: "expense",
              classification: "want",
              date: new Date(),
              walletId: "",
            }),
          },
        });
      },
    });
    setConfirmVisible(true);
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      title: "Hapus",
      message: "Batal menginginkan barang ini?",
      confirmText: "Ya, Hapus",
      variant: "danger",
      onConfirm: async () => {
        await WishlistService.deleteWishlist(id);
        setConfirmVisible(false);
      },
    });
    setConfirmVisible(true);
  };

  const renderItem = ({ item }: { item: Wishlist }) => {
    if (item.status === "purchased") return null;

    const isReady = item.status === "ready" || Date.now() >= item.targetDate;
    const progress = getProgress(item.createdAt, item.targetDate);

    return (
      <View
        className="p-4 rounded-2xl mb-4 border shadow-sm"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowOpacity: isDark ? 0.2 : 0.1,
        }}
      >
        <View className="flex-row justify-between mb-2">
          <View className="flex-1">
            <AppText weight="bold" className="text-lg">
              {item.name}
            </AppText>
            <AppText weight="bold">{formatRupiah(item.price)}</AppText>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>

        <View className="my-3">
          <View className="flex-row justify-between mb-1">
            <AppText variant="caption">
              {isReady ? "Cooling-off Selesai!" : "Menunggu..."}
            </AppText>
            <AppText
              variant="caption"
              weight="bold"
              className={isReady ? "text-green-600" : "text-blue-600"}
              style={{
                color: isReady ? theme.success : theme.info,
              }}
            >
              {isReady ? "Siap Diputuskan" : getRemainingTime(item.targetDate)}
            </AppText>
          </View>

          <View
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.surface }}
          >
            <View
              className={`h-full ${isReady ? "bg-green-500" : "bg-blue-500"}`}
              style={{
                width: `${progress * 100}%`,
                backgroundColor: isReady ? theme.success : theme.info,
              }}
            />
          </View>
        </View>

        {isReady ? (
          <View
            className="mt-2 p-3 rounded-xl"
            style={{
              backgroundColor: isDark ? "rgba(22, 163, 74, 0.15)" : "#F0FDF4", // green-50
            }}
          >
            <AppText
              variant="caption"
              className="text-center mb-2 font-medium"
              style={{ color: theme.success }}
            >
              Waktu berpikir habis! Masih ingin barang ini?
            </AppText>
            <AppButton
              title="Ya, Beli Sekarang"
              onPress={() => handlePurchase(item)}
              variant="primary"
              style={{
                backgroundColor: theme.success,
                borderColor: theme.success,
              }}
              className="h-10"
            />
          </View>
        ) : (
          <View
            className="flex-row gap-2 items-center p-2 rounded-lg"
            style={{ backgroundColor: theme.surface }}
          >
            <Ionicons name="lock-closed-outline" size={14} color={theme.icon} />
            <AppText variant="caption" className="italic">
              Tahan keinginanmu selama {item.durationDays} hari.
            </AppText>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{
          borderBottomColor: theme.divider,
          backgroundColor: theme.background,
        }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <AppText variant="h3" weight="bold">
            Wishlist
          </AppText>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)}>
          <AppText weight="bold">+ Tambah</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={wishlists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <EmptyState
            title="Wishlist Kosong"
            message="Lagi naksir barang apa? Masukkan sini biar nggak impulsif belinya!"
            icon="heart-outline"
            actionLabel="Tambah Wishlist"
            onAction={() => setShowAdd(true)}
          />
        }
      />

      <AddWishlistSheet visible={showAdd} onClose={() => setShowAdd(false)} />

      <ConfirmDialog
        visible={confirmVisible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmVisible(false)}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
      />
    </View>
  );
}
