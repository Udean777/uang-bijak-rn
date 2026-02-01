export type WalletType =
  | "cash"
  | "bank"
  | "e-wallet"
  | "credit-card"
  | "savings"
  | "other";

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWalletPayload {
  name: string;
  type: WalletType;
  initialBalance: number;
  color: string;
}
