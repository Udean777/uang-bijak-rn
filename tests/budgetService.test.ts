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
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({ db: {} }));
jest.mock("@sentry/react-native", () => ({}));
jest.mock("../src/services/AnalyticsService", () => ({
  AnalyticsService: { logEvent: jest.fn() },
}));

import { addDoc, getDocs, updateDoc } from "firebase/firestore";
import { BudgetService } from "../src/services/budgetService";

describe("BudgetService", () => {
  const userId = "user123";
  const budgetPayload = {
    categoryName: "Food",
    limitAmount: 500000,
    month: 1,
    year: 2024,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setBudget", () => {
    it("should create new budget if none exists", async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({ empty: true });
      (addDoc as jest.Mock).mockResolvedValueOnce({ id: "budget1" });

      await BudgetService.setBudget(userId, budgetPayload);

      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("should update budget if it exists", async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({
        empty: false,
        docs: [{ id: "existing-budget", data: () => ({}) }],
      });
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      await BudgetService.setBudget(userId, budgetPayload);

      expect(updateDoc).toHaveBeenCalled();
      expect(addDoc).not.toHaveBeenCalled();
    });
  });
});
