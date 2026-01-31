export type TransactionType = "income" | "expense" | "transfer";
export type TransactionCategory = "need" | "want" | null;

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  targetWalletId?: string; // For transfer transactions
  amount: number;
  type: TransactionType;
  category: string;
  classification: TransactionCategory;
  date: number;
  note?: string;
  imageUrl?: string;
  createdAt: number;
}

export interface CreateTransactionPayload {
  walletId: string;
  targetWalletId?: string; // For transfer transactions
  amount: number;
  type: TransactionType;
  category: string;
  classification: TransactionCategory;
  date: Date;
  note?: string;
}
