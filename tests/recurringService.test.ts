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
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({ db: {} }));
jest.mock("../src/services/transactionService", () => ({
  TransactionService: { addTransaction: jest.fn() },
}));

import { addDoc, getDocs, updateDoc } from "firebase/firestore";
import { RecurringService } from "../src/services/recurringService";
import { TransactionService } from "../src/services/transactionService";

describe("RecurringService", () => {
  const userId = "user123";
  const recurringPayload = {
    walletId: "wallet1",
    amount: 100000,
    type: "expense" as const,
    category: "Internet",
    frequency: "monthly" as const,
    startDate: new Date("2024-01-01"),
    note: "Wifi",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addRecurring", () => {
    it("should call addDoc with correct data", async () => {
      await RecurringService.addRecurring(userId, recurringPayload);
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          userId,
          isActive: true,
          frequency: "monthly",
        }),
      );
    });
  });

  describe("processDueTransactions", () => {
    it("should process due transactions and update nextExecutionDate", async () => {
      const mockDoc = {
        id: "rec1",
        data: () => ({
          walletId: "wallet1",
          amount: 100000,
          type: "expense",
          category: "Internet",
          frequency: "monthly",
          nextExecutionDate: new Date("2024-01-01").getTime(),
          isActive: true,
        }),
      };

      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [mockDoc],
      });

      await RecurringService.processDueTransactions(userId);

      expect(TransactionService.addTransaction).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
