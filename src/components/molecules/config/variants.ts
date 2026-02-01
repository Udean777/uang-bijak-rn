import { ThemeColors } from "@/src/hooks/useTheme";
import { Dimensions } from "react-native";

// ============================================================================
// InsightCard Variants
// ============================================================================

export type InsightType = "danger" | "warning" | "success" | "info";

export const INSIGHT_VARIANTS = {
  danger: {
    bg: "#FEE2E2",
    text: "#EF4444",
    icon: "alert-circle",
    darkBg: "#7f1d1d",
  },
  warning: {
    bg: "#FEF3C7",
    text: "#F59E0B",
    icon: "warning",
    darkBg: "#78350f",
  },
  success: {
    bg: "#D1FAE5",
    text: "#10B981",
    icon: "checkmark-circle",
    darkBg: "#14532d",
  },
  info: {
    bg: "#DBEAFE",
    text: "#3B82F6",
    icon: "information-circle",
    darkBg: "#1e3a8a",
  },
} as const;

export const getInsightStyles = (
  type: InsightType | string,
  isDark: boolean,
  theme: ThemeColors,
) => {
  const variant =
    INSIGHT_VARIANTS[type as keyof typeof INSIGHT_VARIANTS] ||
    INSIGHT_VARIANTS.info;

  if (isDark) {
    return {
      bg: variant.darkBg,
      text: theme.textInverse, // Ensuring readable text on dark colored bg
      borderColor: variant.darkBg,
      icon: variant.icon,
    };
  }

  return {
    bg: variant.bg,
    text: variant.text,
    borderColor: variant.bg,
    icon: variant.icon,
  };
};

// ============================================================================
// Toast Variants
// ============================================================================

export type ToastType = "success" | "error" | "info";

export const TOAST_VARIANTS = {
  success: {
    bg: "bg-green-100",
    border: "border-green-500",
    icon: "checkmark-circle",
    color: "text-green-700",
    darkBg: "bg-green-900",
    darkColor: "text-green-100",
  },
  error: {
    bg: "bg-red-100",
    border: "border-red-500",
    icon: "alert-circle",
    color: "text-red-700",
    darkBg: "bg-red-900",
    darkColor: "text-red-100",
  },
  info: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    icon: "information-circle",
    color: "text-blue-700",
    darkBg: "bg-blue-900",
    darkColor: "text-blue-100",
  },
} as const;

export const getToastStyles = (type: ToastType | string, isDark: boolean) => {
  const variant =
    TOAST_VARIANTS[type as keyof typeof TOAST_VARIANTS] || TOAST_VARIANTS.info;

  if (isDark) {
    return {
      bg: variant.darkBg,
      border: variant.border,
      icon: variant.icon,
      color: variant.darkColor,
      iconColor:
        type === "error"
          ? "#EF4444"
          : type === "success"
            ? "#10B981"
            : "#3B82F6", // Keeping icons bright
    };
  }

  return {
    bg: variant.bg,
    border: variant.border,
    icon: variant.icon,
    color: variant.color,
    iconColor:
      type === "error" ? "#EF4444" : type === "success" ? "#10B981" : "#3B82F6",
  };
};

// ============================================================================
// PinPad Constants
// ============================================================================

const { width } = Dimensions.get("window");
export const PIN_KEY_SIZE = width / 5;
export const PIN_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "",
  "0",
  "backspace",
];
