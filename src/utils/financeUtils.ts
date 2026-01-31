/**
 * Calculate the daily safe-to-spend limit.
 * 
 * @param totalBalance Total balance across all non-credit-card wallets
 * @param pendingBills Sum of bills due this month
 * @param remainingDays Days left in the current month
 * @returns The daily limit amount
 */
export const calculateSafeDailyLimit = (
  totalBalance: number,
  pendingBills: number,
  remainingDays: number
): number => {
  const divisor = remainingDays <= 0 ? 1 : remainingDays;
  const availableFunds = totalBalance - pendingBills;
  
  return Math.max(0, availableFunds / divisor);
};

/**
 * Determine financial status based on daily limit
 */
export const getSafeStatus = (dailyLimit: number): "safe" | "warning" | "danger" => {
  if (dailyLimit < 50000) return "danger";
  if (dailyLimit < 100000) return "warning";
  return "safe";
};
