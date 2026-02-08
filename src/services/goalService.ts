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
import { COLLECTIONS } from "../constants/firebaseCollections";
import { MESSAGES } from "../constants/messages";
import { getErrorMessage } from "../utils/errorUtils";
import { AnalyticsService } from "./AnalyticsService";

export const GoalService = {
  addGoal: async (userId: string, data: CreateGoalPayload) => {
    try {
      await addDoc(collection(db, COLLECTIONS.GOALS), {
        userId,
        ...data,
        deadline: data.deadline ? data.deadline.getTime() : null,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      AnalyticsService.logEvent("create_goal", { name: data.name });
    } catch (error: unknown) {
      throw new Error(MESSAGES.GOAL.CREATE_FAILED + getErrorMessage(error));
    }
  },

  subscribeGoals: (userId: string, onUpdate: (data: Goal[]) => void) => {
    const q = query(
      collection(db, COLLECTIONS.GOALS),
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
      const goalRef = doc(db, COLLECTIONS.GOALS, goalId);
      await updateDoc(goalRef, {
        currentAmount: amount,
        updatedAt: Date.now(),
      });
    } catch (error: unknown) {
      throw new Error(
        MESSAGES.GOAL.UPDATE_PROGRESS_FAILED + getErrorMessage(error),
      );
    }
  },

  updateGoalStatus: async (goalId: string, status: Goal["status"]) => {
    try {
      const goalRef = doc(db, COLLECTIONS.GOALS, goalId);
      await updateDoc(goalRef, {
        status,
        updatedAt: Date.now(),
      });
    } catch (error: unknown) {
      throw new Error(
        MESSAGES.GOAL.UPDATE_STATUS_FAILED + getErrorMessage(error),
      );
    }
  },

  updateGoal: async (goalId: string, data: Partial<CreateGoalPayload>) => {
    try {
      const goalRef = doc(db, COLLECTIONS.GOALS, goalId);
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: Date.now(),
      };
      if (data.deadline) {
        updateData.deadline = data.deadline.getTime();
      }
      await updateDoc(goalRef, updateData);
    } catch (error: unknown) {
      throw new Error(MESSAGES.GOAL.UPDATE_FAILED + getErrorMessage(error));
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.GOALS, goalId));
    } catch (error: unknown) {
      throw new Error(MESSAGES.GOAL.DELETE_FAILED + getErrorMessage(error));
    }
  },
};
