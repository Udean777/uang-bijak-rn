import { ThemeColors } from "@/src/hooks/useTheme";

// ============================================================================
// AppText Variants
// ============================================================================

export const TEXT_VARIANTS = {
  h1: "text-3xl leading-tight",
  h2: "text-2xl leading-snug",
  h3: "text-xl leading-snug",
  body: "text-base leading-relaxed",
  caption: "text-xs leading-normal",
  label: "text-sm leading-none",
} as const;

export const TEXT_WEIGHTS = {
  regular: "font-jakarta",
  medium: "font-jakartaMedium",
  semibold: "font-jakartaSemiBold",
  bold: "font-jakartaBold",
} as const;

export type TextVariant = keyof typeof TEXT_VARIANTS;
export type TextWeight = keyof typeof TEXT_WEIGHTS;
export type TextColor =
  | "primary"
  | "secondary"
  | "error"
  | "default"
  | "white"
  | "success"
  | "danger";

export const getTextColor = (color: TextColor, theme: ThemeColors): string => {
  const colorMap: Record<TextColor, string> = {
    default: theme.text,
    primary: theme.primary,
    secondary: theme.secondary,
    error: theme.danger,
    success: theme.success,
    danger: theme.danger,
    white: "#FFFFFF",
  };
  return colorMap[color];
};

// ============================================================================
// AppButton Variants
// ============================================================================

export const BUTTON_CONTAINER_BASE =
  "flex-row items-center justify-center rounded-xl";

export const BUTTON_VARIANTS = {
  primary: "bg-primary border border-primary",
  secondary:
    "bg-blue-100 dark:bg-blue-900 border border-blue-100 dark:border-blue-900",
  outline: "bg-transparent border",
  ghost: "bg-transparent border-transparent",
  danger: "bg-danger border border-danger",
} as const;

export const BUTTON_SIZES = {
  sm: "py-2 px-3",
  md: "py-3 px-4",
  lg: "py-4 px-6",
} as const;

export const BUTTON_TEXT_COLORS = {
  primary: "white",
  secondary: "primary",
  outline: "default",
  ghost: "white",
  danger: "white",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;

// ============================================================================
// AppBadge Variants
// ============================================================================

export const BADGE_VARIANTS = {
  success: {
    light: { bg: "bg-green-100", textColor: "#15803d" },
    dark: { bg: "bg-green-900/30", textColor: "" }, // Will use theme.success
  },
  warning: {
    light: { bg: "bg-yellow-100", textColor: "#a16207" },
    dark: { bg: "bg-yellow-900/30", textColor: "" }, // Will use theme.warning
  },
  error: {
    light: { bg: "bg-red-100", textColor: "#b91c1c" },
    dark: { bg: "bg-red-900/30", textColor: "" }, // Will use theme.danger
  },
  info: {
    light: { bg: "bg-blue-100", textColor: "#1d4ed8" },
    dark: { bg: "bg-blue-900/30", textColor: "" }, // Will use theme.primary
  },
  default: {
    light: { bg: "bg-gray-100", textColor: "" }, // Will use theme.secondary
    dark: { bg: "bg-gray-800", textColor: "" }, // Will use theme.secondary
  },
} as const;

export const getBadgeTextColor = (
  variant: BadgeVariant,
  isDark: boolean,
  theme: ThemeColors,
): string => {
  const variantConfig = BADGE_VARIANTS[variant][isDark ? "dark" : "light"];
  if (variantConfig.textColor) {
    return variantConfig.textColor;
  }

  // Fallback to theme colors for dark mode
  const themeColorMap: Record<BadgeVariant, string> = {
    success: theme.success,
    warning: theme.warning,
    error: theme.danger,
    info: theme.primary,
    default: theme.secondary,
  };
  return themeColorMap[variant];
};

export type BadgeVariant = keyof typeof BADGE_VARIANTS;

// ============================================================================
// AppCard Variants
// ============================================================================

export const CARD_BASE_CLASSES = "rounded-2xl p-4";

export type CardVariant = "elevated" | "outlined" | "flat";

export const getCardVariantStyles = (
  variant: CardVariant,
  isDark: boolean,
  theme: ThemeColors,
) => {
  const variants = {
    elevated: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      elevation: isDark ? 0 : 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 8,
    },
    outlined: {
      backgroundColor: "transparent",
      borderColor: theme.border,
      borderWidth: 1,
    },
    flat: {
      backgroundColor: theme.surface,
    },
  };
  return variants[variant];
};

// ============================================================================
// Skeleton Variants
// ============================================================================

export const SKELETON_VARIANTS = {
  box: "rounded-xl",
  circle: "rounded-full",
  text: "rounded h-4 my-1",
} as const;

export type SkeletonVariant = keyof typeof SKELETON_VARIANTS;
