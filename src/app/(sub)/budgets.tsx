import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useBudgetTracking } from "@/src/hooks/useBudgetTracking";
import { BudgetService } from "@/src/services/budgetService";
import { Category, CategoryService } from "@/src/services/categoryService";
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

export default function BudgetsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const now = new Date();
  const [selectedMonth] = useState(now.getMonth());
  const [selectedYear] = useState(now.getFullYear());

  const { budgets, isLoading } = useBudgetTracking(selectedMonth, selectedYear);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = CategoryService.subscribeCategories(user.uid, (data) => {
      setCategories(data.filter((c) => c.type === "expense"));
    });
    return () => unsub();
  }, [user]);

  const handleSetBudget = async () => {
    if (!selectedCategory || !limit) {
      Toast.show({
        type: "error",
        text1: "Mohon pilih kategori dan isi limit",
      });
      return;
    }

    setIsSaving(true);
    try {
      await BudgetService.setBudget(user!.uid, {
        categoryName: selectedCategory,
        limitAmount: parseFloat(limit),
        month: selectedMonth,
        year: selectedYear,
      });
      setAddModalVisible(false);
      setSelectedCategory("");
      setLimit("");
      Toast.show({ type: "success", text1: "Budget berhasil diatur!" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const renderBudgetItem = ({ item }: { item: any }) => {
    const percentage = Math.round(item.percentage * 100);
    const isOverBudget = item.currentSpending > item.limitAmount;

    return (
      <View
        className="p-5 rounded-3xl mb-4 border"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <AppText weight="bold" variant="h3">
              {item.categoryName}
            </AppText>
            <AppText variant="caption">
              Limit: Rp {item.limitAmount.toLocaleString("id-ID")}
            </AppText>
          </View>
          <View className="items-end">
            <AppText weight="bold" color={isOverBudget ? "error" : "default"}>
              {percentage}%
            </AppText>
            <AppText variant="caption">Terpakai</AppText>
          </View>
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
              backgroundColor: isOverBudget ? theme.danger : theme.primary,
            }}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <AppText variant="caption">
            Sisa: Rp {Math.max(0, item.remaining).toLocaleString("id-ID")}
          </AppText>
          <TouchableOpacity
            onPress={() => BudgetService.deleteBudget(item.id)}
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
          Budget Kategori
        </AppText>
        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          className="p-2 -mr-2"
        >
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={renderBudgetItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="pie-chart-outline" size={64} color={theme.icon} />
            <AppText className="mt-4 text-center text-gray-500">
              Belum ada budget kategori.{"\n"}Atur limit pengeluaranmu!
            </AppText>
            <AppButton
              title="Atur Budget"
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
              title="Atur Budget"
              onClose={() => setAddModalVisible(false)}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppText
                variant="caption"
                weight="bold"
                className="mb-2 uppercase"
              >
                Pilih Kategori
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6"
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.name)}
                    className="mr-3 px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor:
                        selectedCategory === cat.name
                          ? theme.primary
                          : theme.surface,
                      borderColor:
                        selectedCategory === cat.name
                          ? theme.primary
                          : theme.border,
                    }}
                  >
                    <AppText
                      color={
                        selectedCategory === cat.name ? "white" : "default"
                      }
                      weight="bold"
                    >
                      {cat.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <AppInput
                label="Limit Bulanan (Rp)"
                placeholder="0"
                keyboardType="numeric"
                value={limit}
                onChangeText={setLimit}
                className="mb-8"
              />

              <AppButton
                title="Simpan Budget"
                onPress={handleSetBudget}
                isLoading={isSaving}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
