import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettingsStore } from "@/src/features/settings/store/useSettingsStore";
import { useMemo } from "react";

export type ThemeColors = (typeof Colors)["light"];

export interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: "light" | "dark";
}

/**
 * Centralized theme hook that integrates with Zustand settings store.
 * Returns theme colors, dark mode status, and resolved color scheme.
 *
 * Theme resolution priority:
 * 1. User preference from settings (light/dark)
 * 2. System preference (when set to "system")
 * 3. Fallback to "light"
 */
export const useTheme = (): ThemeContextValue => {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore((s) => s.theme);

  const resolvedScheme = useMemo(() => {
    if (themeSetting === "system") {
      return systemScheme ?? "light";
    }
    return themeSetting;
  }, [themeSetting, systemScheme]);

  return useMemo(
    () => ({
      colors: Colors[resolvedScheme],
      isDark: resolvedScheme === "dark",
      colorScheme: resolvedScheme,
    }),
    [resolvedScheme],
  );
};
