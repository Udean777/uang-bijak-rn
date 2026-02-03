import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { TimeRangeMode } from "../components/FilterSheet";

export const useHistoryScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rangeMode, setRangeMode] = useState<TimeRangeMode>("custom");
  const [showFilter, setShowFilter] = useState(false);
  const [limitCount, setLimitCount] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  // Subscribe to transactions with pagination
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = TransactionService.subscribeTransactions(
      user.uid,
      (data) => {
        setTransactions(data);
        setHasMore(data.length === limitCount);
        setLoading(false);
      },
      limitCount,
    );
    return () => unsub();
  }, [user, limitCount]);

  // Filter transactions based on search, type, and date
  const filteredData = useMemo(() => {
    return transactions.filter((t) => {
      const query = searchQuery.toLowerCase();
      const amountStr = t.amount.toLocaleString("id-ID");

      const matchSearch =
        t.category.toLowerCase().includes(query) ||
        (t.note && t.note.toLowerCase().includes(query)) ||
        amountStr.includes(query) ||
        t.type.toLowerCase().includes(query);

      const matchType = filterType === "all" || t.type === filterType;

      if (rangeMode === "all") return matchSearch && matchType;

      const tDate = new Date(t.date);
      const matchDate =
        tDate.getDate() === selectedDate.getDate() &&
        tDate.getMonth() === selectedDate.getMonth() &&
        tDate.getFullYear() === selectedDate.getFullYear();

      return matchSearch && matchType && matchDate;
    });
  }, [transactions, searchQuery, filterType, selectedDate, rangeMode]);

  const handlePress = (item: Transaction) => {
    router.push({
      pathname: "/(modals)/transaction-detail",
      params: { data: JSON.stringify(item) },
    });
  };

  const loadMore = () => setLimitCount((prev) => prev + 10);
  const clearSearch = () => setSearchQuery("");

  const formattedDate = useMemo(() => {
    const today = new Date();
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday =
      selectedDate.getDate() === yesterday.getDate() &&
      selectedDate.getMonth() === yesterday.getMonth() &&
      selectedDate.getFullYear() === yesterday.getFullYear();

    const dateStr = selectedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (isToday) return `Hari Ini, ${dateStr}`;
    if (isYesterday) return `Kemarin, ${dateStr}`;
    return dateStr;
  }, [selectedDate]);

  const isFilterActive = filterType !== "all" || rangeMode !== "all";

  return {
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
  };
};
