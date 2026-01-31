import { db } from "@/src/config/firebase";
import { CategoryBudget, CreateBudgetPayload } from "@/src/types/budget";
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
import { AnalyticsService } from "./AnalyticsService";

const COLLECTION = "budgets";

export const BudgetService = {
  calculateMonthlyNeeds: async (userId: string): Promise<number> => {
    try {
      const q = query(
        collection(db, "subscriptions"),
        where("userId", "==", userId),
      );
      const snapshot = await getDocs(q);

      let totalNeeds = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalNeeds += Number(data.cost) || 0;
      });

      return totalNeeds;
    } catch (error) {
      console.error("Error calculating budget:", error);
      return 0;
    }
  },

  setBudget: async (userId: string, data: CreateBudgetPayload) => {
    try {
      // Check if budget already exists for this category/month/year
      const q = query(
        collection(db, COLLECTION),
        where("userId", "==", userId),
        where("categoryName", "==", data.categoryName),
        where("month", "==", data.month),
        where("year", "==", data.year),
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        const docRef = doc(db, COLLECTION, existing.docs[0].id);
        await updateDoc(docRef, {
          limitAmount: data.limitAmount,
          updatedAt: Date.now(),
        });
        AnalyticsService.logEvent("update_budget", {
          category: data.categoryName,
        });
      } else {
        await addDoc(collection(db, COLLECTION), {
          userId,
          ...data,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        AnalyticsService.logEvent("set_budget", {
          category: data.categoryName,
        });
      }
    } catch (error: any) {
      throw new Error("Gagal menyimpan budget: " + error.message);
    }
  },

  subscribeBudgets: (
    userId: string,
    month: number,
    year: number,
    onUpdate: (data: CategoryBudget[]) => void,
  ) => {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("month", "==", month),
      where("year", "==", year),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const budgets = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as CategoryBudget,
        );
        onUpdate(budgets);
      },
      (error) => {
        console.error("[BudgetService] Snapshot error:", error);
      },
    );
  },

  deleteBudget: async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
