import { AppText } from "@/src/components/atoms/AppText";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { AddWishlistSheet } from "@/src/features/wishlist/components/AddWishlistSheet";
import { WishlistItem } from "@/src/features/wishlist/components/WishlistItem";
import { useWishlistScreen } from "@/src/features/wishlist/hooks/useWishlistScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function WishlistScreen() {
  const { colors: theme } = useTheme();

  const {
    wishlists,
    showAdd,
    setShowAdd,
    confirmVisible,
    setConfirmVisible,
    confirmConfig,
    handlePurchase,
    handleDelete,
    handleBack,
  } = useWishlistScreen();

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
          <TouchableOpacity onPress={handleBack}>
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
        renderItem={({ item }) => (
          <WishlistItem
            item={item}
            onPurchase={handlePurchase}
            onDelete={handleDelete}
          />
        )}
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
