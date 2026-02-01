// Mock Firebase
jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));
jest.mock("@firebase/auth", () => ({ getReactNativePersistence: jest.fn() }));
jest.mock("@/src/config/firebase", () => ({
  auth: { currentUser: { uid: "user123" } },
}));

// Mock Sentry
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
}));

import * as Sentry from "@sentry/react-native";
import { AnalyticsService } from "../src/services/AnalyticsService";

describe("AnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logEvent", () => {
    it("should add a breadcrumb to Sentry", async () => {
      await AnalyticsService.logEvent("test_event", { foo: "bar" });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "test_event",
          data: { foo: "bar" },
        }),
      );
    });

    it("should capture a message if 'critical' is true", async () => {
      await AnalyticsService.logEvent("critical_error", { critical: true });
      expect(Sentry.captureMessage).toHaveBeenCalled();
    });
  });

  describe("identifyUser", () => {
    it("should call Sentry.setUser", () => {
      AnalyticsService.identifyUser("user123", { email: "test@test.com" });
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: "user123",
        email: "test@test.com",
      });
    });
  });
});
