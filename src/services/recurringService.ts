import { db } from "@/src/config/firebase";
import {
  CreateRecurringPayload,
  RecurringFrequency,
  RecurringTransaction,
} from "@/src/types/recurring";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { TransactionService } from "./transactionService";

const COLLECTION = "recurring_transactions";

const calculateNextDate = (
  currentDate: number,
  frequency: RecurringFrequency,
): number => {
  const date = new Date(currentDate);
  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.getTime();
};

export const RecurringService = {
  addRecurring: async (userId: string, data: CreateRecurringPayload) => {
    try {
      await addDoc(collection(db, COLLECTION), {
        userId,
        ...data,
        startDate: data.startDate.getTime(),
        nextExecutionDate: data.startDate.getTime(),
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      throw new Error("Gagal membuat transaksi berulang: " + error.message);
    }
  },

  subscribeRecurring: (
    userId: string,
    onUpdate: (data: RecurringTransaction[]) => void,
  ) => {
    const q = query(collection(db, COLLECTION), where("userId", "==", userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const recurring = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as RecurringTransaction,
        );
        onUpdate(recurring);
      },
      (error) => {
        console.error("[RecurringService] Snapshot error:", error);
      },
    );
  },

  processDueTransactions: async (userId: string) => {
    const now = Date.now();
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("nextExecutionDate", "<=", now),
    );

    const snapshot = await getDocs(q);

    for (const docSnapshot of snapshot.docs) {
      const recurring = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as RecurringTransaction;

      try {
        // 1. Create the actual transaction
        await TransactionService.addTransaction(userId, {
          walletId: recurring.walletId,
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.category,
          classification: recurring.type === "expense" ? "need" : null,
          date: new Date(recurring.nextExecutionDate),
          note: recurring.note
            ? `${recurring.note} (Berulang)`
            : "Transaksi Berulang",
        });

        // 2. Update next execution date
        const nextDate = calculateNextDate(
          recurring.nextExecutionDate,
          recurring.frequency,
        );
        await updateDoc(doc(db, COLLECTION, recurring.id), {
          nextExecutionDate: nextDate,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error(
          `Failed to process recurring transaction ${recurring.id}:`,
          error,
        );
      }
    }
  },

  deleteRecurring: async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  toggleActive: async (id: string, isActive: boolean) => {
    await updateDoc(doc(db, COLLECTION, id), {
      isActive,
      updatedAt: Date.now(),
    });
  },

  updateRecurring: async (
    id: string,
    data: Partial<CreateRecurringPayload>,
  ) => {
    const updateData: any = { ...data, updatedAt: Date.now() };
    if (data.startDate) {
      updateData.startDate = data.startDate.getTime();
      // If start date changed, re-calculate next execution date based on frequency
      // This logic can be complex depending on if we want to reset or keep schedule.
      // For now, let's assume editing doesn't reset "nextExecutionDate" unless explicitly handled,
      // or we can re-set nextExecutionDate to startDate if it's in the future.
      // SImple approach: Update nextExecutionDate to new startDate
      updateData.nextExecutionDate = data.startDate.getTime();
    }
    await updateDoc(doc(db, COLLECTION, id), updateData);
  },
};
