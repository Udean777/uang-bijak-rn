import { db } from "@/src/config/firebase";
import { CreateGoalPayload, Goal } from "@/src/types/goal";
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
import { AnalyticsService } from "./AnalyticsService";

const COLLECTION = "goals";

export const GoalService = {
  addGoal: async (userId: string, data: CreateGoalPayload) => {
    try {
      await addDoc(collection(db, COLLECTION), {
        userId,
        ...data,
        deadline: data.deadline ? data.deadline.getTime() : null,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      AnalyticsService.logEvent("create_goal", { name: data.name });
    } catch (error: any) {
      throw new Error("Gagal membuat goal: " + error.message);
    }
  },

  subscribeGoals: (userId: string, onUpdate: (data: Goal[]) => void) => {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const goals = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Goal,
        );
        onUpdate(goals);
      },
      (error) => {
        console.error("[GoalService] Snapshot error:", error);
      },
    );
  },

  updateGoalProgress: async (goalId: string, amount: number) => {
    try {
      const goalRef = doc(db, COLLECTION, goalId);
      await updateDoc(goalRef, {
        currentAmount: amount,
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      throw new Error("Gagal memperbarui progress: " + error.message);
    }
  },

  updateGoalStatus: async (goalId: string, status: Goal["status"]) => {
    try {
      const goalRef = doc(db, COLLECTION, goalId);
      await updateDoc(goalRef, {
        status,
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      throw new Error("Gagal memperbarui status: " + error.message);
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION, goalId));
    } catch (error: any) {
      throw new Error("Gagal menghapus goal: " + error.message);
    }
  },
};
