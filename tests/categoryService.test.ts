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
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({ db: {} }));

import { addDoc } from "firebase/firestore";
import { CategoryService } from "../src/services/categoryService";

describe("CategoryService", () => {
  const userId = "user123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addCategory", () => {
    it("should call addDoc with correct data", async () => {
      (addDoc as jest.Mock).mockResolvedValueOnce({ id: "cat1" });

      await CategoryService.addCategory(userId, "Food", "expense");

      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          userId,
          name: "Food",
          type: "expense",
          createdAt: expect.any(Number),
        }),
      );
    });
  });

  describe("subscribeCategories", () => {
    it("should setup a snapshot listener", () => {
      CategoryService.subscribeCategories(userId, jest.fn());
      const { onSnapshot } = require("firebase/firestore");
      expect(onSnapshot).toHaveBeenCalled();
    });
  });
});
