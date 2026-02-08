import {
  collection,
  doc,
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
import { CreateTransactionPayload, Transaction } from "../types/transaction";
import { WalletType } from "../types/wallet";
import { stripUndefined } from "../utils/firestoreUtils";
import { AnalyticsService } from "./AnalyticsService";

const COLLECTION = "transactions";
const WALLET_COLLECTION = "wallets";

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
        const newtxRef = doc(collection(db, COLLECTION));
        const walletRef = doc(db, WALLET_COLLECTION, data.walletId);

        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists()) {
          throw new Error("Dompet tidak ditemukan!");
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
            throw new Error("Dompet tujuan harus dipilih untuk transfer!");
          }
          if (data.walletId === data.targetWalletId) {
            throw new Error("Dompet sumber dan tujuan tidak boleh sama!");
          }

          const targetWalletRef = doc(
            db,
            WALLET_COLLECTION,
            data.targetWalletId,
          );
          const targetWalletDoc = await transaction.get(targetWalletRef);

          if (!targetWalletDoc.exists()) {
            throw new Error("Dompet tujuan tidak ditemukan!");
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
    } catch (error: any) {
      console.error("Transaction Failed: ", error);
      throw new Error(error.message || "Gagal menyimpan transaksi");
    }
  },

  subscribeTransactions: (
    userId: string,
    callback: (data: Transaction[]) => void,
    limitCount: number = 50,
  ) => {
    const q = query(
      collection(db, COLLECTION),
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
      (error) => {
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
      collection(db, COLLECTION),
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
      (error) => {
        console.error("[TransactionService] Monthly Snapshot error:", error);
      },
    );
  },

  deleteTransaction: async (transactionId: string, oldData: Transaction) => {
    try {
      await runTransaction(db, async (transaction) => {
        const txRef = doc(db, COLLECTION, transactionId);
        const walletRef = doc(db, "wallets", oldData.walletId);

        const walletDoc = await transaction.get(walletRef);
        if (!walletDoc.exists()) throw new Error("Dompet tidak ditemukan");

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

          const targetWalletRef = doc(db, "wallets", oldData.targetWalletId);
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
    } catch (error: any) {
      throw new Error("Gagal menghapus: " + error.message);
    }
  },

  updateTransaction: async (
    transactionId: string,
    oldData: Transaction,
    newData: CreateTransactionPayload,
  ) => {
    try {
      await runTransaction(db, async (transaction) => {
        const txRef = doc(db, COLLECTION, transactionId);

        const walletsIds = new Set<string>();
        walletsIds.add(oldData.walletId);

        if (oldData.targetWalletId) walletsIds.add(oldData.targetWalletId);
        walletsIds.add(newData.walletId);

        if (newData.type === "transfer" && newData.targetWalletId) {
          walletsIds.add(newData.targetWalletId);
        }

        const walletMap = new Map<string, any>();
        for (const wId of Array.from(walletsIds)) {
          if (!wId) continue;

          const wRef = doc(db, "wallets", wId);
          const wDoc = await transaction.get(wRef);

          if (!wDoc.exists()) throw new Error(`Dompet ${wId} tidak ditemukan`);

          walletMap.set(wId, { ref: wRef, data: wDoc.data() });
        }

        if (newData.type === "transfer") {
          if (!newData.targetWalletId) {
            throw new Error("Dompet tujuan wajib dipilih untuk transfer!");
          }

          if (newData.walletId === newData.targetWalletId) {
            throw new Error("Dompet sumber dan tujuan tidak boleh sama!");
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
    } catch (error: any) {
      console.error("Update transaction failed:", error);
      throw new Error(error.message || "Gagal mengupdate transaksi");
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
        collection(db, COLLECTION),
        where("userId", "==", userId),
        where("type", "==", "expense"),
        where("category", "==", categoryName),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
      );

      const snapshot = await getDocs(q);
      let total = 0;
      snapshot.forEach((doc: any) => {
        total += doc.data().amount || 0;
      });
      return total;
    } catch (error: any) {
      console.error("Error fetching category spending:", error);
      throw new Error("Gagal mengecek penggunaan budget: " + error.message);
    }
  },
};
