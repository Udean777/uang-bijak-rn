export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
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
  deadline?: Date;
  color: string;
  icon: string;
}
