// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Expo LocalAuthentication
jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

// Mock Expo SecureStore
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock React Native Platform
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { SecurityService } from "../src/services/SecurityService";

describe("SecurityService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkHardware", () => {
    it("should return true if hardware exists and is enrolled", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValueOnce(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValueOnce(
        true,
      );

      const result = await SecurityService.checkHardware();
      expect(result).toBe(true);
    });
  });

  describe("setPin", () => {
    it("should use SecureStore on mobile", async () => {
      await SecurityService.setPin("123456");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_pin",
        "123456",
      );
    });
  });

  describe("validatePin", () => {
    it("should return true if pin matches", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("123456");
      const result = await SecurityService.validatePin("123456");
      expect(result).toBe(true);
    });
  });
});
