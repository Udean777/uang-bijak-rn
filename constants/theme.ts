/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from "react-native";

const Palette = {
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444",
    600: "#DC2626",
  },
  green: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    500: "#22C55E",
    600: "#16A34A",
  },
  common: {
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },
};

export const Colors = {
  light: {
    primary: Palette.blue[600],
    secondary: Palette.gray[500],
    success: Palette.green[600],
    danger: Palette.red[600],
    warning: "#F59E0B",
    info: Palette.blue[500],
    text: Palette.gray[900],
    textSecondary: Palette.gray[500],
    textInverse: Palette.common.white,
    background: Palette.common.white,
    surface: Palette.gray[50],
    card: Palette.common.white,
    border: Palette.gray[200],
    divider: Palette.gray[100],
    icon: Palette.gray[400],
    tint: Palette.blue[600],
    tabIconDefault: Palette.gray[400],
    tabIconSelected: Palette.blue[600],
    modalOverlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    primary: Palette.blue[500],
    secondary: Palette.gray[400],
    success: Palette.green[500],
    danger: Palette.red[500],
    warning: "#FBBF24",
    info: Palette.blue[400],
    text: "#ECEDEE",
    textSecondary: Palette.gray[400],
    textInverse: Palette.common.white,
    background: "#151718",
    surface: "#1F2223",
    card: "#1F2223",
    border: "#303436",
    divider: "#26292A",
    icon: "#9BA1A6",
    tint: Palette.common.white,
    tabIconDefault: "#9BA1A6",
    tabIconSelected: Palette.common.white,
    modalOverlay: "rgba(0, 0, 0, 0.7)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: "JakartaSans",
    medium: "JakartaSansMedium",
    semibold: "JakartaSansSemiBold",
    bold: "JakartaSansBold",
  },
  default: {
    sans: "JakartaSans",
    medium: "JakartaSansMedium",
    semibold: "JakartaSansSemiBold",
    bold: "JakartaSansBold",
  },
});
