import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured. Crash reporting disabled.");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    enabled: !__DEV__, // Only enable in production
    environment: __DEV__ ? "development" : "production",
    release: Constants.expoConfig?.version || "1.0.0",
    tracesSampleRate: 1.0,
    _experiments: {
      profilesSampleRate: 1.0,
    },
    integrations: [
      Sentry.mobileReplayIntegration(),
    ],
  });
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext("extra", context);
  }
  Sentry.captureException(error);
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = "info") => {
  Sentry.captureMessage(message, level);
};

export const setUser = (userId: string, email?: string) => {
  Sentry.setUser({
    id: userId,
    email: email,
  });
};

export const clearUser = () => {
  Sentry.setUser(null);
};

export { Sentry };
