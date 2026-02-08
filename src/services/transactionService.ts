import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  FirestoreError,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/firebaseCollections";
import { MESSAGES } from "../constants/messages";
import { CreateTransactionPayload, Transaction } from "../types/transaction";
import { WalletType } from "../types/wallet";
import { getErrorMessage } from "../utils/errorUtils";
import { stripUndefined } from "../utils/firestoreUtils";
import { AnalyticsService } from "./AnalyticsService";

/**
 * Calculate balance change based on transaction type and wallet type.
 * For credit cards, the logic is inverted:
 * - Expense increases balance (adding to debt)
 * - Income decreases balance (paying off debt)
 */
const calculateBalanceChange = (
  currentBalance: number,
  amount: number,
  transactionType: "income" | "expense",
  walletType: WalletType,
): number => {
  const isCreditCard = walletType === "credit-card";

  if (transactionType === "income") {
    // Income: normally adds to balance, but for credit card it reduces debt
    return isCreditCard ? currentBalance - amount : currentBalance + amount;
  } else {
    // Expense: normally deducts from balance, but for credit card it increases debt
    return isCreditCard ? currentBalance + amount : currentBalance - amount;
  }
};

/**
 * Reverse a balance change (for delete/update operations)
 */
const reverseBalanceChange = (
  currentBalance: number,
  amount: number,
  transactionType: "income" | "expense",
  walletType: WalletType,
): number => {
  const isCreditCard = walletType === "credit-card";

  if (transactionType === "income") {
    // Reverse income: normally subtracts, for credit card it adds back
    return isCreditCard ? currentBalance + amount : currentBalance - amount;
  } else {
    // Reverse expense: normally adds back, for credit card it subtracts
    return isCreditCard ? currentBalance - amount : currentBalance + amount;
  }
};

export const TransactionService = {
  addTransaction: async (userId: string, data: CreateTransactionPayload) => {
    try {
      await runTransaction(db, async (transaction) => {
        const newtxRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
        const walletRef = doc(db, COLLECTIONS.WALLETS, data.walletId);

        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists()) {
          throw new Error(MESSAGES.TRANSACTION.WALLET_NOT_FOUND);
        }

        const walletData = walletDoc.data();
        const currentBalance = walletData.balance;
        const walletType = walletData.type as WalletType;

        let newBalance = currentBalance;
        if (data.type === "income" || data.type === "expense") {
          newBalance = calculateBalanceChange(
            currentBalance,
            data.amount,
            data.type,
            walletType,
          );
        } else if (data.type === "transfer") {
          // For transfers: deduct from source wallet
          if (!data.targetWalletId) {
            throw new Error(MESSAGES.TRANSACTION.TARGET_WALLET_REQUIRED);
          }
          if (data.walletId === data.targetWalletId) {
            throw new Error(MESSAGES.TRANSACTION.SAME_WALLET_ERROR);
          }

          const targetWalletRef = doc(
            db,
            COLLECTIONS.WALLETS,
            data.targetWalletId,
          );
          const targetWalletDoc = await transaction.get(targetWalletRef);

          if (!targetWalletDoc.exists()) {
            throw new Error(MESSAGES.TRANSACTION.TARGET_WALLET_NOT_FOUND);
          }

          const targetWalletData = targetWalletDoc.data();
          const targetBalance = targetWalletData.balance;
          const targetWalletType = targetWalletData.type as WalletType;

          // Deduct from source (treat as expense from source)
          newBalance = calculateBalanceChange(
            currentBalance,
            data.amount,
            "expense",
            walletType,
          );

          // Add to target (treat as income to target)
          const newTargetBalance = calculateBalanceChange(
            targetBalance,
            data.amount,
            "income",
            targetWalletType,
          );

          transaction.update(targetWalletRef, {
            balance: newTargetBalance,
            updatedAt: serverTimestamp(),
          });
        }

        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: serverTimestamp(),
        });

        transaction.set(
          newtxRef,
          stripUndefined({
            ...data,
            userId,
            date: data.date.getTime(),
            createdAt: serverTimestamp(),
          }),
        );
      });

      AnalyticsService.logEvent("add_transaction", {
        type: data.type,
        category: data.category,
        classification: data.classification,
        walletType: data.walletId, // Optional: log wallet ID or look up name
      });
      console.log("Transaksi Berhasil & Saldo Updated!");
    } catch (error: unknown) {
      console.error("Transaction Failed: ", error);
      throw new Error(getErrorMessage(error, MESSAGES.TRANSACTION.SAVE_FAILED));
    }
  },

  subscribeTransactions: (
    userId: string,
    callback: (data: Transaction[]) => void,
    limitCount: number = 50,
  ) => {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(limitCount),
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const transactions = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Transaction,
        );
        callback(transactions);
      },
      (error: FirestoreError) => {
        console.error("[TransactionService] Snapshot error:", error);
      },
    );
  },

  subscribeMonthlyTransactions: (
    userId: string,
    month: number,
    year: number,
    callback: (data: Transaction[]) => void,
  ) => {
    const startDate = new Date(year, month, 1).getTime();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where("userId", "==", userId),
      orderBy("date", "desc"),
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const transactions = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Transaction)
          .filter((t) => t.date >= startDate && t.date <= endDate);
        callback(transactions);
      },
      (error: FirestoreError) => {
        console.error("[TransactionService] Monthly Snapshot error:", error);
      },
    );
  },

  deleteTransaction: async (transactionId: string, oldData: Transaction) => {
    try {
      await runTransaction(db, async (transaction) => {
        const txRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
        const walletRef = doc(db, COLLECTIONS.WALLETS, oldData.walletId);

        const walletDoc = await transaction.get(walletRef);
        if (!walletDoc.exists())
          throw new Error(MESSAGES.TRANSACTION.WALLET_NOT_FOUND);

        const walletData = walletDoc.data();
        const currentBalance = walletData.balance;
        const walletType = walletData.type as WalletType;
        let newBalance = currentBalance;

        if (oldData.type === "expense" || oldData.type === "income") {
          newBalance = reverseBalanceChange(
            currentBalance,
            oldData.amount,
            oldData.type,
            walletType,
          );
        } else if (oldData.type === "transfer" && oldData.targetWalletId) {
          // Reverse transfer: reverse expense from source, reverse income from target
          newBalance = reverseBalanceChange(
            currentBalance,
            oldData.amount,
            "expense",
            walletType,
          );

          const targetWalletRef = doc(
            db,
            COLLECTIONS.WALLETS,
            oldData.targetWalletId,
          );
          const targetWalletDoc = await transaction.get(targetWalletRef);

          if (targetWalletDoc.exists()) {
            const targetWalletData = targetWalletDoc.data();
            const targetBalance = targetWalletData.balance;
            const targetWalletType = targetWalletData.type as WalletType;

            const newTargetBalance = reverseBalanceChange(
              targetBalance,
              oldData.amount,
              "income",
              targetWalletType,
            );

            transaction.update(targetWalletRef, {
              balance: newTargetBalance,
              updatedAt: serverTimestamp(),
            });
          }
        }

        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: serverTimestamp(),
        });
        transaction.delete(txRef);
      });
    } catch (error: unknown) {
      throw new Error(
        MESSAGES.TRANSACTION.DELETE_FAILED + getErrorMessage(error),
      );
    }
  },

  updateTransaction: async (
    transactionId: string,
    oldData: Transaction,
    newData: CreateTransactionPayload,
  ) => {
    try {
      await runTransaction(db, async (transaction) => {
        const txRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);

        const walletsIds = new Set<string>();
        walletsIds.add(oldData.walletId);

        if (oldData.targetWalletId) walletsIds.add(oldData.targetWalletId);
        walletsIds.add(newData.walletId);

        if (newData.type === "transfer" && newData.targetWalletId) {
          walletsIds.add(newData.targetWalletId);
        }

        const walletMap = new Map<
          string,
          { ref: DocumentReference; data: DocumentData }
        >();
        for (const wId of Array.from(walletsIds)) {
          if (!wId) continue;

          const wRef = doc(db, COLLECTIONS.WALLETS, wId);
          const wDoc = await transaction.get(wRef);

          if (!wDoc.exists()) throw new Error(`Dompet ${wId} tidak ditemukan`);

          walletMap.set(wId, { ref: wRef, data: wDoc.data() });
        }

        if (newData.type === "transfer") {
          if (!newData.targetWalletId) {
            throw new Error(MESSAGES.TRANSACTION.TARGET_WALLET_REQUIRED);
          }

          if (newData.walletId === newData.targetWalletId) {
            throw new Error(MESSAGES.TRANSACTION.SAME_WALLET_ERROR);
          }
        }

        const applyBalanceChange = (
          walletId: string,
          amount: number,
          type: "income" | "expense",
          isReversal: boolean,
        ) => {
          const wallet = walletMap.get(walletId);
          if (!wallet) return;

          const currentBalance = wallet.data.balance;
          const wType = wallet.data.type as WalletType;

          let newBalance;

          if (isReversal) {
            newBalance = reverseBalanceChange(
              currentBalance,
              amount,
              type,
              wType,
            );
          } else {
            newBalance = calculateBalanceChange(
              currentBalance,
              amount,
              type,
              wType,
            );
          }

          wallet.data.balance = newBalance;
        };

        if (oldData.type === "transfer") {
          applyBalanceChange(oldData.walletId, oldData.amount, "expense", true);

          if (oldData.targetWalletId) {
            applyBalanceChange(
              oldData.targetWalletId,
              oldData.amount,
              "income",
              true,
            );
          }
        } else {
          applyBalanceChange(
            oldData.walletId,
            oldData.amount,
            oldData.type,
            true,
          );
        }

        if (newData.type === "transfer") {
          applyBalanceChange(
            newData.walletId,
            newData.amount,
            "expense",
            false,
          );
          if (newData.targetWalletId) {
            applyBalanceChange(
              newData.targetWalletId,
              newData.amount,
              "income",
              false,
            );
          }
        } else {
          applyBalanceChange(
            newData.walletId,
            newData.amount,
            newData.type,
            false,
          );
        }

        walletMap.forEach((val) => {
          transaction.update(val.ref, {
            balance: val.data.balance,
            updatedAt: serverTimestamp(),
          });
        });

        transaction.update(
          txRef,
          stripUndefined({
            ...newData,
            date: newData.date.getTime(),
            updatedAt: serverTimestamp(),
          }),
        );
      });
    } catch (error: unknown) {
      console.error("Update transaction failed:", error);
      throw new Error(
        getErrorMessage(error, MESSAGES.TRANSACTION.UPDATE_FAILED),
      );
    }
  },

  getCategorySpending: async (
    userId: string,
    categoryName: string,
    month: number,
    year: number,
  ): Promise<number> => {
    try {
      const startDate = new Date(year, month, 1).getTime();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where("userId", "==", userId),
        where("type", "==", "expense"),
        where("category", "==", categoryName),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
      );

      const snapshot = await getDocs(q);
      let total = 0;
      snapshot.forEach((doc) => {
        total += doc.data().amount || 0;
      });
      return total;
    } catch (error: unknown) {
      console.error("Error fetching category spending:", error);
      throw new Error(
        MESSAGES.TRANSACTION.CHECK_BUDGET_FAILED + getErrorMessage(error),
      );
    }
  },
};
