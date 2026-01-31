// Mock Firebase
jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));
jest.mock("@firebase/auth", () => ({ getReactNativePersistence: jest.fn() }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));
jest.mock("@/src/config/firebase", () => ({ db: {} }));

// Mock Expo FileSystem and Sharing
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "/tmp/",
  writeAsStringAsync: jest.fn(),
}));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn(),
}));

import { getDocs } from "firebase/firestore";
import { ExportService } from "../src/services/ExportService";

describe("ExportService", () => {
  const userId = "user123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("exportTransactionsToCSV", () => {
    it("should fetch data and call sharing API", async () => {
      // Mock transactions
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [
          {
            id: "tx1",
            data: () => ({
              amount: 50000,
              type: "expense",
              category: "Food",
              date: new Date().getTime(),
              walletId: "w1",
            }),
          },
        ],
      });
      // Mock wallets
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [
          {
            id: "w1",
            data: () => ({ name: "Cash" }),
          },
        ],
      });

      await ExportService.exportTransactionsToCSV(userId);

      const { writeAsStringAsync } = require("expo-file-system/legacy");
      const { shareAsync } = require("expo-sharing");

      expect(getDocs).toHaveBeenCalledTimes(2);
      expect(writeAsStringAsync).toHaveBeenCalled();
      expect(shareAsync).toHaveBeenCalled();
    });
  });
});
