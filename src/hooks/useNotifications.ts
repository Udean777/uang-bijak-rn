import { useEffect, useRef } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { DebtService } from "../services/debtService";
import { NotificationService } from "../services/NotificationService";
import { SubscriptionService } from "../services/subscriptionService";
import { WishlistService } from "../services/wishlistService";
import { Debt } from "../types/debt";
import { Subscription } from "../types/subscription";
import { Wishlist } from "../types/wishlist";

/**
 * Hook to manage notification permissions and schedule bill reminders
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const hasRequestedPermission = useRef(false);

  // Request permissions once when user logs in
  useEffect(() => {
    if (user && !hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      NotificationService.requestPermissions();
    }
  }, [user]);

  // Subscribe to subscriptions and schedule reminders
  useEffect(() => {
    if (!user) return;

    const unsubscribe = SubscriptionService.subscribeSubscriptions(
      user.uid,
      async (subscriptions: Subscription[]) => {
        // Schedule reminders for active subscriptions
        for (const sub of subscriptions) {
          if (sub.isActive) {
            await NotificationService.scheduleBillReminder(sub);
          }
        }
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to debts and schedule reminders
  useEffect(() => {
    if (!user) return;

    const unsubscribe = DebtService.subscribeDebts(
      user.uid,
      async (debts: Debt[]) => {
        for (const debt of debts) {
          if (debt.status === "unpaid") {
            await NotificationService.scheduleDebtReminder(debt);
          }
        }
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to wishlist and schedule reminders
  useEffect(() => {
    if (!user) return;

    const unsubscribe = WishlistService.subscribeWishlists(
      user.uid,
      async (wishlist: Wishlist[]) => {
        for (const item of wishlist) {
          if (item.status === "waiting") {
            await NotificationService.scheduleWishlistReady(
              item.id,
              item.name,
              item.targetDate,
            );
          }
        }
      },
    );

    return () => unsubscribe();
  }, [user]);
};
