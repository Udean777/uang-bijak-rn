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
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({ db: {} }));

import { addDoc } from "firebase/firestore";
import { SubscriptionService } from "../src/services/subscriptionService";

describe("SubscriptionService", () => {
  const userId = "user123";
  const subPayload = {
    name: "Netflix",
    cost: 150000,
    dueDate: 15,
    category: "Entertainment",
    color: "#E50914",
    icon: "film",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addSubscription", () => {
    it("should call addDoc with calculated nextPaymentDate", async () => {
      await SubscriptionService.addSubscription(userId, subPayload);
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          userId,
          name: "Netflix",
          isActive: true,
          nextPaymentDate: expect.any(Number),
        }),
      );
    });
  });

  describe("getPendingBillsTotal", () => {
    it("should calculate total correctly", () => {
      const now = new Date();
      const nextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      ).getTime();

      const subs: any[] = [
        { cost: 100000, nextPaymentDate: now.getTime(), isActive: true },
        { cost: 50000, nextPaymentDate: now.getTime(), isActive: true },
        { cost: 200000, nextPaymentDate: nextMonth, isActive: true }, // Out of current month
        { cost: 300000, nextPaymentDate: now.getTime(), isActive: false }, // Inactive
      ];

      const total = SubscriptionService.getPendingBillsTotal(subs);
      expect(total).toBe(150000);
    });
  });
});
