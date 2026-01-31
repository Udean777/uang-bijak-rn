import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Wishlist, WishlistStatus } from "../types/wishlist";

export const WishlistService = {
  addWishlist: async (
    userId: string,
    data: { name: string; price: number; durationDays: number; note?: string },
  ) => {
    const createdAt = Date.now();
    const targetDate = createdAt + data.durationDays * 24 * 60 * 60 * 1000;

    await addDoc(collection(db, "wishlists"), {
      userId,
      ...data,
      createdAt,
      targetDate,
      status: "waiting",
    });
  },

  updateStatus: async (id: string, status: WishlistStatus) => {
    await updateDoc(doc(db, "wishlists", id), { status });
  },

  deleteWishlist: async (id: string) => {
    await deleteDoc(doc(db, "wishlists", id));
  },

  subscribeWishlists: (
    userId: string,
    callback: (list: Wishlist[]) => void,
  ) => {
    const q = query(
      collection(db, "wishlists"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Wishlist[];

        const now = Date.now();
        data.forEach((item) => {
          if (item.status === "waiting" && now >= item.targetDate) {
            WishlistService.updateStatus(item.id, "ready");
            item.status = "ready";
          }
        });

        callback(data);
      },
      (error) => {
        console.error("[WishlistService] Snapshot error:", error);
      },
    );
  },
};
