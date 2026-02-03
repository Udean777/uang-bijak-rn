import { useCallback } from "react";

/**
 * Hook for formatting and parsing currency values in Indonesian Rupiah format
 * Format: 1.000.000 (dots as thousand separators)
 */
export const useCurrencyFormat = () => {
  /**
   * Format a number to Indonesian currency display format
   * @param value - Raw number or string
   * @returns Formatted string like "1.000.000"
   */
  const formatCurrency = useCallback((value: number | string): string => {
    if (value === "" || value === null || value === undefined) return "";

    // Remove non-numeric characters
    const numericValue = String(value).replace(/\D/g, "");
    if (!numericValue) return "";

    // Format with dots as thousand separators
    return parseInt(numericValue, 10).toLocaleString("id-ID");
  }, []);

  /**
   * Parse formatted currency string back to number
   * @param formatted - Formatted string like "1.000.000"
   * @returns Raw number like 1000000
   */
  const parseCurrency = useCallback((formatted: string): number => {
    if (!formatted) return 0;
    const cleaned = formatted.replace(/\./g, "");
    return parseInt(cleaned, 10) || 0;
  }, []);

  /**
   * Handle input change with auto-formatting
   * @param text - Raw input text
   * @param onChange - Callback with formatted value
   */
  const handleCurrencyChange = useCallback(
    (text: string, onChange: (formatted: string) => void) => {
      const formatted = formatCurrency(text);
      onChange(formatted);
    },
    [formatCurrency],
  );

  return {
    formatCurrency,
    parseCurrency,
    handleCurrencyChange,
  };
};

// Standalone utility functions for use outside of hooks
export const formatCurrency = (value: number | string): string => {
  if (value === "" || value === null || value === undefined) return "";
  const numericValue = String(value).replace(/\D/g, "");
  if (!numericValue) return "";
  return parseInt(numericValue, 10).toLocaleString("id-ID");
};

export const parseCurrency = (formatted: string): number => {
  if (!formatted) return 0;
  const cleaned = formatted.replace(/\./g, "");
  return parseInt(cleaned, 10) || 0;
};
