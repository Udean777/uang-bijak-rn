export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  frequency: RecurringFrequency;
  startDate: number;
  nextExecutionDate: number;
  note?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRecurringPayload {
  walletId: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  frequency: RecurringFrequency;
  startDate: Date;
  note?: string;
}
