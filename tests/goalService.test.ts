// Mock Firebase
jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));
jest.mock("@firebase/auth", () => ({ getReactNativePersistence: jest.fn() }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({ db: {} }));
jest.mock("@sentry/react-native", () => ({}));
jest.mock("../src/services/AnalyticsService", () => ({
  AnalyticsService: { logEvent: jest.fn() },
}));

import { addDoc, updateDoc } from "firebase/firestore";
import { GoalService } from "../src/services/goalService";

describe("GoalService", () => {
  const userId = "user123";
  const goalData = {
    name: "New iPhone",
    targetAmount: 20000000,
    currentAmount: 0,
    deadline: new Date("2024-12-31"),
    color: "#FF0000",
    icon: "phone",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addGoal", () => {
    it("should create goal with correct data", async () => {
      await GoalService.addGoal(userId, goalData);
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          userId,
          name: "New iPhone",
          status: "active",
        }),
      );
    });
  });

  describe("updateGoalProgress", () => {
    it("should update currentAmount", async () => {
      await GoalService.updateGoalProgress("goal1", 5000000);
      expect(updateDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          currentAmount: 5000000,
        }),
      );
    });
  });
});
