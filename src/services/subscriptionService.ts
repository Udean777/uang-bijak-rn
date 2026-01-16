import { db } from "@/src/config/firebase";
import {
  CreateSubscriptionPayload,
  Subscription,
} from "@/src/types/subscription";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const COLLECTION = "subscriptions";

export const SubscriptionService = {
  addSubscription: async (userId: string, data: CreateSubscriptionPayload) => {
    await addDoc(collection(db, COLLECTION), {
      userId,
      ...data,
      isActive: true,
      createdAt: Date.now(),
    });
  },

  subscribeSubscriptions: (
    userId: string,
    callback: (data: Subscription[]) => void
  ) => {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("cost", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Subscription
      );
      callback(subs);
    });
  },

  deleteSubscription: async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
