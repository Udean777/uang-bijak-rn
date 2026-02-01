import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWallets } from "@/src/features/wallets/hooks/useWallets";
import { GoalService } from "@/src/services/goalService";
import { Goal } from "@/src/types/goal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function GoalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { wallets } = useWallets();
  const savingsWallets = wallets.filter((w) => w.type === "savings");
  const hasSavingsWallet = savingsWallets.length > 0;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = GoalService.subscribeGoals(user.uid, (data) => {
      // Perbarui currentAmount berdasarkan saldo dompet yang terhubung
      const updatedGoals = data.map((goal) => {
        if (goal.walletId) {
          const wallet = wallets.find((w) => w.id === goal.walletId);
          if (wallet) {
            return { ...goal, currentAmount: wallet.balance };
          }
        }
        return goal;
      });
      setGoals(updatedGoals);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user, wallets]);

  useEffect(() => {
    if (hasSavingsWallet && !selectedWalletId) {
      setSelectedWalletId(savingsWallets[0].id);
    }
  }, [hasSavingsWallet]);

  const handleAddGoal = async () => {
    if (!name || !target) {
      Toast.show({ type: "error", text1: "Mohon isi nama dan target dana" });
      return;
    }

    setIsSaving(true);
    try {
      await GoalService.addGoal(user!.uid, {
        name,
        targetAmount: parseFloat(target),
        currentAmount: 0, // Akan diupdate sinkron dengan balance wallet
        walletId: selectedWalletId,
        color: "#3B82F6", // Default blue
        icon: "trophy",
      });
      setAddModalVisible(false);
      setName("");
      setTarget("");
      setSelectedWalletId(savingsWallets[0]?.id || "");
      Toast.show({ type: "success", text1: "Goal ditambahkan! 🎯" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = Math.min(item.currentAmount / item.targetAmount, 1);
    const percentage = Math.round(progress * 100);
    const linkedWallet = wallets.find((w) => w.id === item.walletId);

    return (
      <View
        className="p-5 rounded-3xl mb-4 border"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: item.color + "20" }}
            >
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View>
              <AppText weight="bold" variant="h3">
                {item.name}
              </AppText>
              <AppText variant="caption">
                Target: Rp {item.targetAmount.toLocaleString("id-ID")}
              </AppText>
            </View>
          </View>
          <AppText weight="bold" style={{ color: item.color }}>
            {percentage}%
          </AppText>
        </View>

        {/* Progress Bar */}
        <View
          className="h-3 w-full rounded-full mb-3"
          style={{ backgroundColor: isDark ? "#333" : "#F3F4F6" }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: item.color,
            }}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <AppText variant="caption" weight="medium">
              Terkumpul: Rp {item.currentAmount.toLocaleString("id-ID")}
            </AppText>
            {linkedWallet && (
              <View className="flex-row items-center mt-1">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: linkedWallet.color }}
                />
                <AppText variant="caption" style={{ opacity: 0.6 }}>
                  Dompet: {linkedWallet.name}
                </AppText>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => GoalService.deleteGoal(item.id)}
            className="p-1"
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b flex-row justify-between items-center"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
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
        renderItem={renderGoalItem}
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

      {/* Add Goal Modal */}
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
                    onPress={() => {
                      setAddModalVisible(false);
                      router.push({
                        pathname: "/(modals)/add-wallet",
                        params: { type: "savings" },
                      } as any);
                    }}
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
