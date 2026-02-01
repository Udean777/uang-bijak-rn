import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { GoalItem } from "@/src/features/goals/components/GoalItem";
import { useGoalsScreen } from "@/src/features/goals/hooks/useGoalsScreen";
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

export default function GoalsScreen() {
  const { colors: theme, isDark } = useTheme();

  const {
    goals,
    isSaving,
    isAddModalVisible,
    setAddModalVisible,
    name,
    setName,
    target,
    setTarget,
    selectedWalletId,
    setSelectedWalletId,
    savingsWallets,
    hasSavingsWallet,
    wallets,
    handleAddGoal,
    handleDeleteGoal,
    handleBack,
    handleCreateSavingsWallet,
  } = useGoalsScreen();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold">
          Target Menabung
        </AppText>
        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          className="p-2 -mr-2"
        >
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalItem item={item} wallets={wallets} onDelete={handleDeleteGoal} />
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="flag-outline" size={64} color={theme.icon} />
            <AppText className="mt-4 text-center text-gray-500">
              Belum ada target menabung.{"\n"}Ayo buat target pertamamu!
            </AppText>
            <AppButton
              title="Buat Target"
              className="mt-6 px-8"
              onPress={() => setAddModalVisible(true)}
            />
          </View>
        }
      />

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="rounded-t-[40px] p-6 pb-10"
            style={{ backgroundColor: theme.background }}
          >
            <ModalHeader
              title="Target Baru"
              onClose={() => setAddModalVisible(false)}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              {!hasSavingsWallet ? (
                <View
                  className="p-5 rounded-2xl mb-6 border-2 border-dashed"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(245, 158, 11, 0.1)"
                      : "#FFFBEB",
                    borderColor: "#F59E0B",
                  }}
                >
                  <View className="flex-row gap-3 mb-3">
                    <Ionicons
                      name="warning-outline"
                      size={24}
                      color="#F59E0B"
                    />
                    <View className="flex-1">
                      <AppText weight="bold" style={{ color: "#F59E0B" }}>
                        Dompet Menabung Belum Ada
                      </AppText>
                      <AppText variant="caption" className="mt-1">
                        Untuk membuat target, kamu wajib memiliki dompet khusus
                        menabung untuk menampung dana target ini.
                      </AppText>
                    </View>
                  </View>
                  <AppButton
                    title="Buat Dompet Menabung Sekarang"
                    variant="primary"
                    onPress={handleCreateSavingsWallet}
                  />
                </View>
              ) : (
                <>
                  <AppInput
                    label="Nama Target"
                    placeholder="Misal: Liburan ke Jepang, Dana Darurat"
                    value={name}
                    onChangeText={setName}
                    className="mb-4"
                  />
                  <AppInput
                    label="Target Nominal (Rp)"
                    placeholder="0"
                    keyboardType="numeric"
                    value={target}
                    onChangeText={setTarget}
                    className="mb-4"
                  />

                  <View className="mb-6">
                    <AppText variant="label" className="mb-2">
                      Hubungkan ke Dompet
                    </AppText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="flex-row"
                    >
                      {savingsWallets.map((wallet) => (
                        <TouchableOpacity
                          key={wallet.id}
                          onPress={() => setSelectedWalletId(wallet.id)}
                          className="mr-3 p-3 rounded-xl border flex-row items-center gap-2"
                          style={{
                            backgroundColor:
                              selectedWalletId === wallet.id
                                ? theme.primary + "20"
                                : theme.card,
                            borderColor:
                              selectedWalletId === wallet.id
                                ? theme.primary
                                : theme.border,
                          }}
                        >
                          <View
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: wallet.color }}
                          />
                          <AppText
                            weight={
                              selectedWalletId === wallet.id
                                ? "bold"
                                : "regular"
                            }
                          >
                            {wallet.name} (Rp{" "}
                            {wallet.balance.toLocaleString("id-ID")})
                          </AppText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <AppText variant="caption" className="mt-2 text-gray-500">
                      Dana target ini akan otomatis mengikuti saldo dompet
                      menabung yang kamu pilih.
                    </AppText>
                  </View>

                  <AppButton
                    title="Simpan Target"
                    onPress={handleAddGoal}
                    isLoading={isSaving}
                    disabled={!selectedWalletId}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
