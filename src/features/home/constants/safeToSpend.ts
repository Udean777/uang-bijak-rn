import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const CAROUSEL_CONFIG = {
  cardWidth: SCREEN_WIDTH - 40,
  swipeThreshold: (SCREEN_WIDTH - 40) * 0.25,
  cardHeight: 170,
  springConfig: { damping: 20, stiffness: 200 },
} as const;

export const STATUS_COLORS = {
  safe: "#16a34a",
  warning: "#eab308",
  danger: "#dc2626",
} as const;

export const STATUS_MESSAGES = {
  safe: "Keuanganmu aman! Pertahankan pengeluaranmu di bawah batas harian.",
  warning: "Hati-hati! Kamu mulai mendekati batas boros. Kurangi jajan ya!",
  danger:
    "Bahaya! Kamu sudah melebihi batas wajar. Stop pengeluaran tidak perlu!",
} as const;

export const STATUS_ICONS = {
  safe: "shield-checkmark",
  warning: "alert",
  danger: "warning",
} as const;
