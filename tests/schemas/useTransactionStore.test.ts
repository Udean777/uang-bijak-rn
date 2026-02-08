jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));
jest.mock("@firebase/auth", () => ({ getReactNativePersistence: jest.fn() }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({
  db: {},
  auth: {},
}));

import { useTransactionStore } from "@/src/features/transactions/store/useTransactionStore";
import { TransactionService } from "@/src/services/transactionService";
import { CreateTransactionPayload } from "@/src/types/transaction";

jest.mock("@/src/services/transactionService", () => ({
  TransactionService: {
    addTransaction: jest.fn(),
    subscribeTransactions: jest.fn(() => () => {}), // Return unsubscribe fn
  },
}));

describe("useTransactionStore Optimistic UI", () => {
  const mockPayload: CreateTransactionPayload = {
    amount: 10000,
    category: "Food",
    date: new Date(),
    type: "expense",
    walletId: "wallet-1",
    classification: "need",
  };

  beforeEach(() => {
    useTransactionStore.setState({ transactions: [] });
    jest.clearAllMocks();
  });

  it("should add transaction optimistically (update state before service resolves)", async () => {
    // Setup mock to delay slightly so we can check intermediate state
    (TransactionService.addTransaction as jest.Mock).mockImplementation(
      async () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const promise = useTransactionStore
      .getState()
      .addTransaction("user-1", mockPayload);

    // CHECK 1: State should be updated IMMEDIATELY
    const transactions = useTransactionStore.getState().transactions;
    expect(transactions.length).toBe(1);
    expect(transactions[0].id).toContain("temp-"); // Should have temp ID
    expect(transactions[0].amount).toBe(10000);
    await promise;

    // CHECK 2: Service should have been called
    expect(TransactionService.addTransaction).toHaveBeenCalledWith(
      "user-1",
      mockPayload,
    );
  });

  it("should rollback state if service fails", async () => {
    // Setup mock to FAIL
    (TransactionService.addTransaction as jest.Mock).mockRejectedValue(
      new Error("Network Error"),
    );

    try {
      await useTransactionStore
        .getState()
        .addTransaction("user-1", mockPayload);
    } catch (error: unknown) {
      // Expected error
    }

    // CHECK: State should be empty again (Rollback successful)
    const transactions = useTransactionStore.getState().transactions;

    expect(transactions.length).toBe(0);
  });
});
