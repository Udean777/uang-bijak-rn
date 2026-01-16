export interface TransactionTemplate {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  walletId: string;
  icon: string;
}
