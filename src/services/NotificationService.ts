import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Debt } from "../types/debt";
import { Subscription } from "../types/subscription";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATIONS_ENABLED_KEY = "is_notifications_enabled";

export const NotificationService = {
  /**
   * Check if notifications are enabled by user
   */
  isNotificationsEnabled: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return value === "true";
  },

  /**
   * Set notification enabled status
   */
  setNotificationsEnabled: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled));
  },

  /**
   * Request notification permissions
   */
  requestPermissions: async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.warn(
        "Notifications are being requested on a simulator. While push tokens won't work, local notifications still can.",
      );
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission not granted");
      return false;
    }

    // Android requires a notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("bills", {
        name: "Tagihan",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B6B",
      });

      await Notifications.setNotificationChannelAsync("debts", {
        name: "Utang & Piutang",
        importance: Notifications.AndroidImportance.DEFAULT,
      });

      await Notifications.setNotificationChannelAsync("wishlist", {
        name: "Wishlist",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    return true;
  },

  /**
   * Get Expo Push Token
   */
  getPushToken: async (): Promise<string | null> => {
    try {
      if (!Device.isDevice) return null;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return null;

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  },

  /**
   * Schedule a notification for a subscription bill
   */
  scheduleBillReminder: async (
    subscription: Subscription,
  ): Promise<string[] | null> => {
    try {
      // Cancel existing notifications for this subscription
      await NotificationService.cancelNotification(
        `bill-${subscription.id}-1d`,
      );
      await NotificationService.cancelNotification(
        `bill-${subscription.id}-2d`,
      );

      const nextPaymentDate = new Date(subscription.nextPaymentDate);
      const now = new Date();
      const identifiers: string[] = [];

      // Schedule reminders for 1 day and 2 days before due date
      const daysBefore = [1, 2];

      for (const offset of daysBefore) {
        const reminderDate = new Date(nextPaymentDate);
        reminderDate.setDate(reminderDate.getDate() - offset);
        reminderDate.setHours(9, 0, 0, 0); // 9 AM

        // Don't schedule if reminder date is in the past
        if (reminderDate > now) {
          const identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Tagihan Mendatang! 💸",
              body: `${subscription.name} - Rp ${subscription.cost.toLocaleString("id-ID")} jatuh tempo ${offset} hari lagi.`,
              data: { type: "subscription", id: subscription.id },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: reminderDate,
              channelId: "bills",
            },
            identifier: `bill-${subscription.id}-${offset}d`,
          });
          identifiers.push(identifier);
        }
      }

      return identifiers.length > 0 ? identifiers : null;
    } catch (error) {
      console.error("Failed to schedule bill reminder:", error);
      return null;
    }
  },

  /**
   * Schedule a notification for a debt due date
   */
  scheduleDebtReminder: async (debt: Debt): Promise<string | null> => {
    try {
      await NotificationService.cancelNotification(`debt-${debt.id}`);

      const dueDate = new Date(debt.dueDate);
      const now = new Date();

      // Schedule reminder 1 day before due date
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0);

      if (reminderDate <= now) {
        return null;
      }

      const isPayable = debt.type === "payable";
      const title = isPayable
        ? "Utang Jatuh Tempo Besok! 🔔"
        : "Piutang Jatuh Tempo Besok! 💰";
      const body = isPayable
        ? `Bayar Rp ${debt.amount.toLocaleString("id-ID")} ke ${debt.personName} besok.`
        : `Tagih Rp ${debt.amount.toLocaleString("id-ID")} dari ${debt.personName} besok.`;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: "debt", id: debt.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
          channelId: "debts",
        },
        identifier: `debt-${debt.id}`,
      });

      return identifier;
    } catch (error) {
      console.error("Failed to schedule debt reminder:", error);
      return null;
    }
  },

  /**
   * Schedule a notification for wishlist ready
   */
  scheduleWishlistReady: async (
    wishlistId: string,
    name: string,
    targetDate: number,
  ): Promise<string | null> => {
    try {
      await NotificationService.cancelNotification(`wishlist-${wishlistId}`);

      const readyDate = new Date(targetDate);
      readyDate.setHours(10, 0, 0, 0); // 10 AM

      const now = new Date();
      if (readyDate <= now) {
        return null;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Wishlist Siap! 🎉",
          body: `Masa tunggu "${name}" sudah selesai. Saatnya memutuskan!`,
          data: { type: "wishlist", id: wishlistId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: readyDate,
          channelId: "wishlist",
        },
        identifier: `wishlist-${wishlistId}`,
      });

      return identifier;
    } catch (error) {
      console.error("Failed to schedule wishlist notification:", error);
      return null;
    }
  },

  /**
   * Cancel a scheduled notification
   */
  cancelNotification: async (identifier: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      // Ignore errors if notification doesn't exist
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get all scheduled notifications (for debugging)
   */
  getScheduledNotifications: async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  /**
   * Send an immediate local notification
   */
  sendLocalNotification: async (
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
    });
  },
};
