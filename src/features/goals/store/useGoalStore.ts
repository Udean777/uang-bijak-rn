import { GoalService } from "@/src/services/goalService";
import { CreateGoalPayload, Goal } from "@/src/types/goal";
import { create } from "zustand";

interface GoalState {
  goals: Goal[];
  isLoading: boolean;

  // Actions
  initializeGoals: (userId: string) => () => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (userId: string, data: CreateGoalPayload) => Promise<void>;
  updateProgress: (goalId: string, amount: number) => Promise<void>;
  updateStatus: (goalId: string, status: Goal["status"]) => Promise<void>;
  updateGoal: (
    goalId: string,
    data: Partial<CreateGoalPayload>,
  ) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  isLoading: false,

  initializeGoals: (userId) => {
    set({ isLoading: true });
    const unsubscribe = GoalService.subscribeGoals(userId, (data) => {
      set({ goals: data, isLoading: false });
    });
    return unsubscribe;
  },

  setGoals: (goals) => set({ goals }),

  addGoal: async (userId, data) => {
    set({ isLoading: true });
    try {
      await GoalService.addGoal(userId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProgress: async (goalId, amount) => {
    try {
      await GoalService.updateGoalProgress(goalId, amount);
    } catch (error: unknown) {
      throw error;
    }
  },

  updateStatus: async (goalId, status) => {
    try {
      await GoalService.updateGoalStatus(goalId, status);
    } catch (error: unknown) {
      throw error;
    }
  },

  updateGoal: async (goalId, data) => {
    set({ isLoading: true });
    try {
      await GoalService.updateGoal(goalId, data);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGoal: async (goalId) => {
    try {
      await GoalService.deleteGoal(goalId);
    } catch (error: unknown) {
      throw error;
    }
  },
}));
