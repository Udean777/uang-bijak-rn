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
import { Debt, DebtStatus } from "../types/debt";

export const DebtService = {
  addDebt: async (
    userId: string,
    data: Omit<Debt, "id" | "createdAt" | "status" | "userId">
  ) => {
    await addDoc(collection(db, "debts"), {
      userId,
      ...data,
      status: "unpaid",
      createdAt: Date.now(),
    });
  },

  updateStatus: async (id: string, status: DebtStatus) => {
    await updateDoc(doc(db, "debts", id), { status });
  },

  deleteDebt: async (id: string) => {
    await deleteDoc(doc(db, "debts", id));
  },

  subscribeDebts: (userId: string, callback: (list: Debt[]) => void) => {
    const q = query(
      collection(db, "debts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Debt[];
      callback(data);
    });
  },
};
