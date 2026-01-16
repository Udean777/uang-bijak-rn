export type DebtType = "payable" | "receivable";
export type DebtStatus = "unpaid" | "paid";

export interface Debt {
  id: string;
  userId: string;
  personName: string;
  amount: number;
  type: DebtType;
  dueDate: number;
  status: DebtStatus;
  note?: string;
  createdAt: number;
}
