import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { AddCategoryModal } from "@/src/features/transactions/components/AddCategoryModal";
import { ClassificationPicker } from "@/src/features/transactions/components/ClassificationPicker";
import { HorizontalSelector } from "@/src/features/transactions/components/HorizontalSelector";
import { TransactionTypePicker } from "@/src/features/transactions/components/TransactionTypePicker";
import { useTransactionForm } from "@/src/features/transactions/hooks/useTransactionForm";
import { formatCurrency } from "@/src/hooks/useCurrencyFormat";
import { useTheme } from "@/src/hooks/useTheme";
import { Wallet } from "@/src/types/wallet";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";

export default function AddTransactionScreen() {
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  const {
    type,
    setType,
    amount,
    setAmount,
    category,
    setCategory,
    categories,
    classification,
    setClassification,
    selectedWalletId,
    setSelectedWalletId,
    targetWalletId,
    setTargetWalletId,
    note,
    setNote,
    isLoading,
    isEditMode,
    isCategoryModalVisible,
    setCategoryModalVisible,
    newCategoryName,
    setNewCategoryName,
    wallets,
    handleSave,
    saveNewCategory,
    handleClose,
  } = useTransactionForm({ editDataParam: params.editData as string });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenLoader
        visible={isLoading}
        text={isEditMode ? "Updating..." : "Menyimpan..."}
      />

      <ModalHeader
        title={isEditMode ? "Edit Transaksi" : "Tambah Transaksi"}
        subtitle={
          isEditMode ? "Perbarui data transaksi" : "Catat aliran dana baru"
        }
        onClose={handleClose}
      />

      <ScrollView className="flex-1 p-5">
        <TransactionTypePicker type={type} setType={setType} />

        <View className="mb-6">
          <AppText variant="caption" weight="bold" className="uppercase mb-2">
            Nominal (Rp)
          </AppText>
          <TextInput
            className={`text-4xl font-bold pb-2 border-b ${isDark ? "text-white" : "text-[#333333]"}`}
            style={{ borderBottomColor: colors.divider }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.icon}
            value={amount}
            onChangeText={(text) => setAmount(formatCurrency(text))}
            autoFocus={!isEditMode}
          />
        </View>

        {type !== "transfer" && (
          <HorizontalSelector
            label="Kategori"
            data={categories.filter((c) => c.type === type)}
            selectedId={category}
            idExtractor={(c) => c.name}
            labelExtractor={(c) => c.name}
            onSelect={setCategory}
            renderExtra={() => (
              <TouchableOpacity
                className="mr-3 px-4 py-2 rounded-full border border-dashed justify-center"
                style={{ borderColor: colors.border }}
                onPress={() => setCategoryModalVisible(true)}
              >
                <AppText weight="bold">+ Baru</AppText>
              </TouchableOpacity>
            )}
          />
        )}

        {type === "expense" && (
          <ClassificationPicker
            classification={classification}
            setClassification={setClassification}
          />
        )}

        {type === "transfer" ? (
          <>
            <HorizontalSelector
              label="Dari Dompet"
              data={wallets}
              selectedId={selectedWalletId}
              idExtractor={(w: Wallet) => w.id}
              labelExtractor={(w: Wallet) => w.name}
              onSelect={(id) => {
                setSelectedWalletId(id);
                if (targetWalletId === id) setTargetWalletId("");
              }}
            />
            <HorizontalSelector
              label="Ke Dompet"
              data={wallets.filter((w: Wallet) => w.id !== selectedWalletId)}
              selectedId={targetWalletId}
              idExtractor={(w: Wallet) => w.id}
              labelExtractor={(w: Wallet) => w.name}
              onSelect={setTargetWalletId}
              activeBgColor="#3B82F6"
            />
          </>
        ) : (
          <HorizontalSelector
            label="Sumber Dana"
            data={wallets}
            selectedId={selectedWalletId}
            idExtractor={(w: Wallet) => w.id}
            labelExtractor={(w: Wallet) => w.name}
            onSelect={setSelectedWalletId}
          />
        )}

        <View className="mb-8">
          <AppInput
            label="Catatan"
            value={note}
            onChangeText={setNote}
            placeholder="Keterangan transaksi..."
            multiline
            className="h-24 py-4"
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View className="p-5 border-t" style={{ borderTopColor: colors.divider }}>
        <AppButton
          title={isEditMode ? "Update Transaksi" : "Simpan Transaksi"}
          onPress={handleSave}
          isLoading={isLoading}
          variant={type === "expense" ? "danger" : "primary"}
          className={
            type === "expense"
              ? ""
              : type === "transfer"
                ? "bg-blue-500 border-blue-500"
                : "bg-green-600 border-green-600"
          }
        />
      </View>

      <AddCategoryModal
        visible={isCategoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSave={saveNewCategory}
        categoryName={newCategoryName}
        setCategoryName={setNewCategoryName}
        type={type}
      />
    </View>
  );
}
