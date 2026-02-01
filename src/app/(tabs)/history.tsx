import { AppText } from "@/src/components/atoms/AppText";
import { Skeleton } from "@/src/components/atoms/Skeleton";
import { EmptyState } from "@/src/components/molecules/EmptyState";
import { FilterSheet } from "@/src/features/transactions/components/FilterSheet";
import { TransactionItem } from "@/src/features/transactions/components/TransactionItem";
import { useHistoryScreen } from "@/src/features/transactions/hooks/useHistoryScreen";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, TextInput, TouchableOpacity, View } from "react-native";

export default function HistoryScreen() {
  const { colors: theme } = useTheme();

  const {
    loading,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    selectedDate,
    setSelectedDate,
    rangeMode,
    setRangeMode,
    showFilter,
    setShowFilter,
    filteredData,
    hasMore,
    limitCount,
    handlePress,
    loadMore,
    clearSearch,
    formattedDate,
    isFilterActive,
  } = useHistoryScreen();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        className="px-5 pb-4 border-b z-10"
        style={{
          backgroundColor: theme.background,
          borderBottomColor: theme.divider,
        }}
      >
        <AppText variant="h2" weight="bold" className="mb-4">
          Riwayat
        </AppText>

        <View className="flex-row gap-3">
          <View
            className="flex-1 flex-row items-center rounded-xl px-3 h-12"
            style={{ backgroundColor: theme.surface }}
          >
            <Ionicons name="search" size={20} color={theme.icon} />
            <TextInput
              className="flex-1 ml-2 font-medium h-full"
              style={{ color: theme.text }}
              placeholder="Cari transaksi..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilter(true)}
            className="w-12 h-12 items-center justify-center rounded-xl border"
            style={{
              backgroundColor: isFilterActive ? "#2563EB" : theme.surface,
              borderColor: isFilterActive ? "#2563EB" : theme.border,
            }}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={isFilterActive ? "white" : theme.text}
            />
          </TouchableOpacity>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <AppText variant="caption">
            {rangeMode === "all" ? "Semua Waktu" : formattedDate}
          </AppText>
          <AppText variant="caption">Total: {filteredData.length} Data</AppText>
        </View>
      </View>

      {loading ? (
        <View className="p-5 gap-y-3">
          <Skeleton
            variant="box"
            width="100%"
            height={70}
            className="rounded-xl"
          />
          <Skeleton
            variant="box"
            width="100%"
            height={70}
            className="rounded-xl"
          />
          <Skeleton
            variant="box"
            width="100%"
            height={70}
            className="rounded-xl"
          />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View
              className="mb-3 rounded-xl border overflow-hidden"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <TransactionItem transaction={item} onPress={handlePress} />
            </View>
          )}
          ListFooterComponent={() =>
            hasMore && filteredData.length >= limitCount ? (
              <TouchableOpacity
                onPress={loadMore}
                className="py-4 items-center justify-center rounded-xl border-2 border-dashed mx-5 mb-10"
                style={{ borderColor: theme.border }}
              >
                <AppText weight="bold" style={{ color: theme.primary }}>
                  Load More (+10)
                </AppText>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Tidak ditemukan"
              message="Tidak ada transaksi yang cocok dengan filter pencarianmu."
              className="py-20"
            />
          }
        />
      )}

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedType={filterType}
        onTypeChange={setFilterType}
        rangeMode={rangeMode}
        onRangeModeChange={setRangeMode}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </View>
  );
}
