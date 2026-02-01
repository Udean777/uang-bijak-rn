import {
  collection,
  doc,
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
        const oldWalletRef = doc(db, "wallets", oldData.walletId);
        const newWalletRef = doc(db, "wallets", newData.walletId);

        // Note: For simplicity, we don't support editing transfers to/from transfers
        // or changing wallet types mid-edit. This handles basic income/expense edits.
        if (oldData.walletId === newData.walletId) {
          const walletDoc = await transaction.get(oldWalletRef);
          if (!walletDoc.exists()) throw new Error("Dompet tidak ditemukan");

          const walletData = walletDoc.data();
          let balance = walletData.balance;
          const walletType = walletData.type as WalletType;

          // Reverse old transaction
          if (oldData.type === "expense" || oldData.type === "income") {
            balance = reverseBalanceChange(
              balance,
              oldData.amount,
              oldData.type,
              walletType,
            );
          }

          // Apply new transaction
          if (newData.type === "expense" || newData.type === "income") {
            balance = calculateBalanceChange(
              balance,
              newData.amount,
              newData.type,
              walletType,
            );
          }

          transaction.update(oldWalletRef, {
            balance,
            updatedAt: serverTimestamp(),
          });
        } else {
          const oldWalletDoc = await transaction.get(oldWalletRef);
          const newWalletDoc = await transaction.get(newWalletRef);

          if (!oldWalletDoc.exists() || !newWalletDoc.exists())
            throw new Error("Dompet tidak ditemukan");

          const oldWalletData = oldWalletDoc.data();
          const newWalletData = newWalletDoc.data();
          const oldWalletType = oldWalletData.type as WalletType;
          const newWalletType = newWalletData.type as WalletType;

          // Reverse old transaction on old wallet
          let oldBalance = oldWalletData.balance;
          if (oldData.type === "expense" || oldData.type === "income") {
            oldBalance = reverseBalanceChange(
              oldBalance,
              oldData.amount,
              oldData.type,
              oldWalletType,
            );
          }

          // Apply new transaction on new wallet
          let newBalance = newWalletData.balance;
          if (newData.type === "expense" || newData.type === "income") {
            newBalance = calculateBalanceChange(
              newBalance,
              newData.amount,
              newData.type,
              newWalletType,
            );
          }

          transaction.update(oldWalletRef, {
            balance: oldBalance,
            updatedAt: serverTimestamp(),
          });
          transaction.update(newWalletRef, {
            balance: newBalance,
            updatedAt: serverTimestamp(),
          });
        }

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
      throw new Error("Gagal mengupdate: " + error.message);
    }
  },
};
