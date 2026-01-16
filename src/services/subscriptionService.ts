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
  updateDoc,
  where,
} from "firebase/firestore";

const COLLECTION = "subscriptions";

const calculateInitialNextPayment = (day: number): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let targetDate = new Date(currentYear, currentMonth, day);

  if (targetDate.getTime() < now.getTime()) {
    targetDate = new Date(currentYear, currentMonth + 1, day);
  }

  return targetDate.getTime();
};

const getNextMonthDate = (
  currentTimestamp: number,
  fixedDay: number
): number => {
  const date = new Date(currentTimestamp);
  date.setMonth(date.getMonth() + 1);

  date.setDate(fixedDay);

  return date.getTime();
};

export const SubscriptionService = {
  addSubscription: async (userId: string, data: CreateSubscriptionPayload) => {
    const nextPayment = calculateInitialNextPayment(data.dueDate);

    await addDoc(collection(db, COLLECTION), {
      userId,
      ...data,
      nextPaymentDate: nextPayment,
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

  renewSubscription: async (
    id: string,
    currentNextPayment: number,
    fixedDay: number
  ) => {
    try {
      const subRef = doc(db, COLLECTION, id);
      const newDate = getNextMonthDate(currentNextPayment, fixedDay);

      await updateDoc(subRef, {
        nextPaymentDate: newDate,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
