export interface CategoryBudget {
  id: string;
  userId: string;
  categoryName: string;
  limitAmount: number;
  month: number; // 0-11
  year: number;
  createdAt: number;
}

export interface CreateBudgetPayload {
  categoryName: string;
  limitAmount: number;
  month: number;
  year: number;
}
