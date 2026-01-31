// Mock Firebase
jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));
jest.mock("@firebase/auth", () => ({
  getReactNativePersistence: jest.fn(),
}));
jest.mock("firebase/firestore");
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({
  db: {},
}));

import { addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { WalletService } from "../src/services/walletService";

describe("WalletService", () => {
  const userId = "user123";
  const mockWalletPayload = {
    name: "Main Wallet",
    initialBalance: 1000000,
    type: "cash" as const,
    color: "#FF0000",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createWallet", () => {
    it("should call addDoc with correct data", async () => {
      (addDoc as jest.Mock).mockResolvedValueOnce({ id: "wallet1" });

      await WalletService.createWallet(userId, mockWalletPayload);

      expect(addDoc).toHaveBeenCalledWith(
        undefined, // collection() returns undefined in mock if not configured
        expect.objectContaining({
          userId,
          name: "Main Wallet",
          balance: 1000000,
          isArchived: false,
        }),
      );
    });

    it("should throw error if addDoc fails", async () => {
      (addDoc as jest.Mock).mockRejectedValueOnce(new Error("Firebase Error"));

      await expect(
        WalletService.createWallet(userId, mockWalletPayload),
      ).rejects.toThrow("Gagal membuat dompet: Firebase Error");
    });
  });

  describe("updateWallet", () => {
    it("should call updateDoc with correct data", async () => {
      const walletId = "wallet1";
      const updateData = { name: "Updated Wallet" };
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      await WalletService.updateWallet(walletId, updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        undefined, // doc() mock
        expect.objectContaining({
          name: "Updated Wallet",
          updatedAt: expect.any(Number),
        }),
      );
    });
  });

  describe("deleteWallet", () => {
    it("should call deleteDoc with correct ref", async () => {
      const walletId = "wallet1";
      (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

      await WalletService.deleteWallet(walletId);

      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
