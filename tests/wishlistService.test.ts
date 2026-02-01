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
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({ db: {} }));

import { addDoc, updateDoc } from "firebase/firestore";
import { WishlistService } from "../src/services/wishlistService";

describe("WishlistService", () => {
  const userId = "user123";
  const itemData = {
    name: "PlayStation 5",
    price: 8000000,
    durationDays: 30,
    note: "Saving up",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addWishlist", () => {
    it("should call addDoc with correct data", async () => {
      await WishlistService.addWishlist(userId, itemData);
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          userId,
          name: "PlayStation 5",
          status: "waiting",
          targetDate: expect.any(Number),
        }),
      );
    });
  });

  describe("updateStatus", () => {
    it("should call updateDoc", async () => {
      await WishlistService.updateStatus("wish1", "ready");
      expect(updateDoc).toHaveBeenCalledWith(undefined, { status: "ready" });
    });
  });
});
