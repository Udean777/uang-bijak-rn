import { AppButton } from "@/src/components/atoms/AppButton";
import { AppText } from "@/src/components/atoms/AppText";
import { CurrencyInput } from "@/src/components/atoms/CurrencyInput";
import { ModalHeader } from "@/src/components/molecules/ModalHeader";
import { BudgetItem } from "@/src/features/budgets/components/BudgetItem";
import { useBudgetsScreen } from "@/src/features/budgets/hooks/useBudgetsScreen";
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

export default function BudgetsScreen() {
  const { colors: theme } = useTheme();

  const {
    budgets,
    isSaving,
    categories,
    isAddModalVisible,
    setAddModalVisible,
    selectedCategory,
    setSelectedCategory,
    limit,
    setLimit,
    handleSetBudget,
    handleDeleteBudget,
    handleBack,
  } = useBudgetsScreen();

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
        renderItem={({ item }) => (
          <BudgetItem item={item} onDelete={handleDeleteBudget} />
        )}
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

              <CurrencyInput
                label="Limit Bulanan"
                value={limit}
                onChangeText={setLimit}
                containerClass="mb-8"
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
