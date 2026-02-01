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

import { addDoc, updateDoc } from "firebase/firestore";
import { DebtService } from "../src/services/debtService";

describe("DebtService", () => {
  const userId = "user123";
  const debtData = {
    title: "Car Loan",
    amount: 50000000,
    lender: "Bank ABC",
    dueDate: new Date().getTime(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addDebt", () => {
    it("should add debt with unpaid status", async () => {
      await DebtService.addDebt(userId, debtData as any);
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          userId,
          title: "Car Loan",
          status: "unpaid",
        }),
      );
    });
  });

  describe("updateStatus", () => {
    it("should update status via updateDoc", async () => {
      await DebtService.updateStatus("debt1", "paid");
      expect(updateDoc).toHaveBeenCalledWith(undefined, { status: "paid" });
    });
  });
});
