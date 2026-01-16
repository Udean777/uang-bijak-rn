export type WishlistStatus = "waiting" | "ready" | "purchased" | "cancelled";

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  price: number;
  durationDays: number;
  createdAt: number;
  targetDate: number;
  status: WishlistStatus;
  note?: string;
}
