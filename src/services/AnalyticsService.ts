import { auth } from "@/src/config/firebase";
import * as Sentry from "@sentry/react-native";

/**
 * Analytics Service for tracking user behavior.
 * Currently integrated with Sentry (for breadcrumbs/context) 
 * and can be extended to Firebase Analytics or Mixpanel.
 */
export const AnalyticsService = {
  /**
   * Log a custom event
   */
  logEvent: async (eventName: string, params?: Record<string, any>) => {
    try {
      const user = auth.currentUser;
      
      // 1. Log to Sentry as breadcrumb (very useful for debugging)
      Sentry.addBreadcrumb({
        category: "analytics",
        message: eventName,
        level: "info",
        data: params,
      });

      // 2. Track with Sentry Event (if important)
      if (params?.critical) {
        Sentry.captureMessage(`Critical Event: ${eventName}`, {
          level: "info",
          extra: params,
        });
      }

      // 3. Placeholder for Firebase Analytics
      // if (analytics) logEvent(analytics, eventName, params);

      console.log(`[Analytics] Event: ${eventName}`, params);
    } catch (error) {
      console.error("Failed to log analytics event:", error);
    }
  },

  /**
   * Track Screen View
   */
  logScreenView: async (screenName: string) => {
    AnalyticsService.logEvent("screen_view", { screen_name: screenName });
  },

  /**
   * Track User Identity
   */
  identifyUser: (userId: string, traits?: Record<string, any>) => {
    Sentry.setUser({ id: userId, ...traits });
    console.log(`[Analytics] Identified user: ${userId}`);
  },
};
