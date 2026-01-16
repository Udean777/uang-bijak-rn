export interface Subscription {
  id: string;
  userId: string;
  name: string;
  cost: number;
  dueDate: number;
  nextPaymentDate: number;
  isActive: boolean;
  color?: string;
}

export interface CreateSubscriptionPayload {
  name: string;
  cost: number;
  dueDate: number;
}
