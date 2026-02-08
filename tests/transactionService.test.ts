// Mock Firebase
jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));
jest.mock("@firebase/auth", () => ({
  getReactNativePersistence: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(() => 123456789),
}));
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));
jest.mock("../src/services/AnalyticsService", () => ({
  AnalyticsService: {
    logEvent: jest.fn(),
  },
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({
  db: {},
}));

import { Transaction } from "@/src/types/transaction";
import { runTransaction } from "firebase/firestore";
import { TransactionService } from "../src/services/transactionService";

describe("TransactionService", () => {
  const userId = "user123";
  const mockWalletId = "wallet-source";
  const mockTargetWalletId = "wallet-target";

  const mockWalletData = {
    balance: 1000000,
    type: "cash",
  };

  const mockTransactionRequest = {
    walletId: mockWalletId,
    amount: 100000,
    type: "expense" as const,
    category: "Food",
    classification: "need" as const,
    date: new Date("2024-01-31"),
    note: "Lunch",
  };

  // Use a more specific type for the mocked transaction object
  let mockTx: {
    get: jest.Mock;
    update: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTx = {
      get: jest.fn(),
      update: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    (runTransaction as jest.Mock).mockImplementation((db, callback) =>
      callback(mockTx),
    );
  });

  describe("addTransaction", () => {
    it("should process an expense correctly", async () => {
      mockTx.get.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockWalletData,
      });

      await TransactionService.addTransaction(userId, mockTransactionRequest);

      expect(mockTx.get).toHaveBeenCalled();
      // Expense should subtract from balance: 1,000,000 - 100,000 = 900,000
      expect(mockTx.update).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ balance: 900000 }),
      );
      expect(mockTx.set).toHaveBeenCalled();
    });

    it("should process a transfer correctly", async () => {
      const transferRequest = {
        ...mockTransactionRequest,
        type: "transfer" as const,
        targetWalletId: mockTargetWalletId,
        category: "Transfer",
      };

      // Mock source wallet
      mockTx.get.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockWalletData,
      });
      // Mock target wallet
      mockTx.get.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ balance: 500000, type: "bank" }),
      });

      await TransactionService.addTransaction(userId, transferRequest);

      // Source should be deducted: 1,000,000 - 100,000 = 900,000
      expect(mockTx.update).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ balance: 900000 }),
      );
      // Target should be increased: 500,000 + 100,000 = 600,000
      expect(mockTx.update).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ balance: 600000 }),
      );
    });

    it("should throw error if wallets are the same in transfer", async () => {
      const transferRequest = {
        ...mockTransactionRequest,
        type: "transfer" as const,
        targetWalletId: mockWalletId, // Same as source
      };

      mockTx.get.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockWalletData,
      });

      await expect(
        TransactionService.addTransaction(userId, transferRequest),
      ).rejects.toThrow("Dompet sumber dan tujuan tidak boleh sama!");
    });
  });

  describe("deleteTransaction", () => {
    it("should reverse an expense correctly", async () => {
      const oldData: Transaction = {
        id: "tx1",
        userId: userId,
        walletId: mockWalletId,
        amount: 50000,
        type: "expense",
        classification: "need",
        date: Date.now(),
        createdAt: Date.now(),
      };

      mockTx.get.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockWalletData,
      });

      await TransactionService.deleteTransaction("tx1", oldData);

      // Reversing expense should add back: 1,000,000 + 50,000 = 1,050,000
      expect(mockTx.update).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ balance: 1050000 }),
      );
      expect(mockTx.delete).toHaveBeenCalled();
    });
  });
});
