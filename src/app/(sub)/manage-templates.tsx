import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ConfirmDialog } from "@/src/components/molecules/ConfirmDialog";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { TemplateItem } from "@/src/features/templates/components/TemplateItem";
import { useManageTemplatesScreen } from "@/src/features/templates/hooks/useManageTemplatesScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManageTemplatesScreen() {
  const { colors: theme } = useTheme();

  const {
    templates,
    isLoading,
    wallets,
    isModalVisible,
    setModalVisible,
    form,
    updateForm,
    confirmVisible,
    setConfirmVisible,
    confirmConfig,
    handleSave,
    handleDelete,
    handleBack,
  } = useManageTemplatesScreen();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{
          backgroundColor: theme.background,
          borderBottomColor: theme.divider,
        }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <AppText variant="h3" weight="bold">
            Kelola Shortcut
          </AppText>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <AppText weight="bold">+ Tambah</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TemplateItem item={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Belum Ada Shortcut"
            message="Buat tombol cepat untuk transaksi yang sering kamu lakukan."
            icon="flash-outline"
            actionLabel="Buat Shortcut"
            onAction={() => setModalVisible(true)}
          />
        }
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: theme.modalOverlay }}
        >
          <View
            className="rounded-t-3xl p-6 h-[70%]"
            style={{ backgroundColor: theme.background }}
          >
            <ModalHeader
              title="Shortcut Baru"
              onClose={() => setModalVisible(false)}
            />

            <ScrollView>
              <AppInput
                label="Nama Shortcut"
                placeholder="Contoh: Kopi Kenangan"
                value={form.name}
                onChangeText={(v) => updateForm("name", v)}
              />
              <CurrencyInput
                label="Nominal"
                value={form.amount}
                onChangeText={(v) => updateForm("amount", v)}
              />
              <AppInput
                label="Kategori"
                placeholder="Makan, Transport, dll"
                value={form.category}
                onChangeText={(v) => updateForm("category", v)}
              />

              <AppText variant="label" className="mb-2 my-2">
                Sumber Dana Otomatis
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4 mt-2"
              >
                {wallets.map((w) => {
                  const isSelected = form.walletId === w.id;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => updateForm("walletId", w.id)}
                      className="mr-2 px-4 py-2 rounded-full border"
                      style={{
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      }}
                    >
                      <AppText
                        color={isSelected ? "white" : "default"}
                        weight={isSelected ? "bold" : "regular"}
                      >
                        {w.name}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </ScrollView>

            <AppButton
              title="Simpan Shortcut"
              onPress={handleSave}
              isLoading={isLoading}
            />
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmVisible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmVisible(false)}
        confirmText={confirmConfig.confirmText}
        variant="danger"
      />
    </View>
  );
}
