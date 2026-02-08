// Mock Expo Notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: "date", TIME_INTERVAL: "timeInterval" },
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
}));

// Mock Expo Device
jest.mock("expo-device", () => ({ isDevice: true }));

// Mock Expo Constants
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: "test-project-id",
      },
    },
  },
}));

// Mock React Native Platform
jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));

import { Subscription } from "@/src/types/subscription";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../src/services/NotificationService";

describe("NotificationService", () => {
  const mockSubscription: Subscription = {
    id: "sub1",
    userId: "user123",
    name: "Spotify",
    dueDate: 1,
    color: "#1DB954",
    cost: 50000,
    nextPaymentDate: new Date().getTime() + 86400000 * 2, // 2 days from now
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requestPermissions", () => {
    it("should return true if granted", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });
      const result = await NotificationService.requestPermissions();
      expect(result).toBe(true);
    });
  });

  describe("scheduleBillReminder", () => {
    it("should call scheduleNotificationAsync", async () => {
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce("notif1");
      await NotificationService.scheduleBillReminder(mockSubscription);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });
});
