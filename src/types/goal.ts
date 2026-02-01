export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  walletId?: string; // ID of the specific savings wallet
  deadline?: number; // Timestamp
  color: string;
  icon: string;
  status: "active" | "achieved" | "cancelled";
  createdAt: number;
  updatedAt: number;
}

export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  currentAmount: number;
  walletId?: string;
  deadline?: Date;
  color: string;
  icon: string;
}
