import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { WishlistService } from "@/src/services/wishlistService";
import { Wishlist } from "@/src/types/wishlist";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useWishlistStore } from "../store/useWishlistStore";

export const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export const getRemainingTime = (targetDate: number) => {
  const diff = targetDate - Date.now();
  if (diff <= 0) return "Waktu Habis";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} Hari Lagi`;
};

export const getProgress = (created: number, target: number) => {
  const total = target - created;
  const elapsed = Date.now() - created;
  const progress = elapsed / total;
  return Math.min(Math.max(progress, 0), 1);
};

export const useWishlistScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateStatus, deleteWishlist, setWishlists } = useWishlistStore();

  const [wishlists, setLocalWishlists] = useState<Wishlist[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "primary" as "primary" | "danger",
    confirmText: "Ya, Lanjutkan",
  });

  // Subscribe to wishlists
  useEffect(() => {
    if (!user) return;
    const unsub = WishlistService.subscribeWishlists(user.uid, (data) => {
      setLocalWishlists(data);
      setWishlists(data);
    });
    return () => unsub();
  }, [user]);

  const handlePurchase = (item: Wishlist) => {
    setConfirmConfig({
      title: "Konfirmasi Pembelian",
      message:
        "Hebat! Kamu sudah menunggu dengan sabar. Apakah kamu yakin ingin membeli ini sekarang?",
      confirmText: "Ya, Beli & Catat",
      variant: "primary",
      onConfirm: async () => {
        await updateStatus(item.id, "purchased");
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
        await deleteWishlist(id);
        setConfirmVisible(false);
      },
    });
    setConfirmVisible(true);
  };

  const handleBack = () => router.back();

  return {
    wishlists,
    showAdd,
    setShowAdd,
    confirmVisible,
    setConfirmVisible,
    confirmConfig,
    handlePurchase,
    handleDelete,
    handleBack,
  };
};
