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

const COLLECTION = "transactions";
const WALLET_COLLECTION = "wallets";

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

        const currentBalance = walletDoc.data().balance;

        let newBalance = currentBalance;
        if (data.type === "income") {
          newBalance += data.amount;
        } else if (data.type === "expense") {
          newBalance -= data.amount;
        }

        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: serverTimestamp(),
        });

        transaction.set(newtxRef, {
          ...data,
          userId,
          date: data.date.getTime(),
          createdAt: serverTimestamp(),
        });
      });

      console.log("Transaksi Berhasil & Saldo Updated!");
    } catch (error: any) {
      console.error("Transaction Failed: ", error);
      throw new Error(error.message || "Gagal menyimpan transaksi");
    }
  },

  subscribeTransactions: (
    userId: string,
    callback: (data: Transaction[]) => void
  ) => {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(50)
    );

    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const transactions = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Transaction
      );
      callback(transactions);
    });
  },

  deleteTransaction: async (transactionId: string, oldData: Transaction) => {
    try {
      await runTransaction(db, async (transaction) => {
        const txRef = doc(db, COLLECTION, transactionId);
        const walletRef = doc(db, "wallets", oldData.walletId);

        const walletDoc = await transaction.get(walletRef);
        if (!walletDoc.exists()) throw new Error("Dompet tidak ditemukan");

        const currentBalance = walletDoc.data().balance;
        let newBalance = currentBalance;

        if (oldData.type === "expense") {
          newBalance += oldData.amount;
        } else if (oldData.type === "income") {
          newBalance -= oldData.amount;
        }

        transaction.update(walletRef, { balance: newBalance });
        transaction.delete(txRef);
      });
    } catch (error: any) {
      throw new Error("Gagal menghapus: " + error.message);
    }
  },

  updateTransaction: async (
    transactionId: string,
    oldData: Transaction,
    newData: CreateTransactionPayload
  ) => {
    try {
      await runTransaction(db, async (transaction) => {
        const txRef = doc(db, COLLECTION, transactionId);
        const oldWalletRef = doc(db, "wallets", oldData.walletId);
        const newWalletRef = doc(db, "wallets", newData.walletId);

        if (oldData.walletId === newData.walletId) {
          const walletDoc = await transaction.get(oldWalletRef);
          if (!walletDoc.exists()) throw new Error("Dompet tidak ditemukan");

          let balance = walletDoc.data().balance;

          if (oldData.type === "expense") balance += oldData.amount;
          else balance -= oldData.amount;

          if (newData.type === "expense") balance -= newData.amount;
          else balance += newData.amount;

          transaction.update(oldWalletRef, { balance });
        } else {
          const oldWalletDoc = await transaction.get(oldWalletRef);
          const newWalletDoc = await transaction.get(newWalletRef);

          if (!oldWalletDoc.exists() || !newWalletDoc.exists())
            throw new Error("Dompet tidak ditemukan");

          let oldBalance = oldWalletDoc.data().balance;
          if (oldData.type === "expense") oldBalance += oldData.amount;
          else oldBalance -= oldData.amount;

          let newBalance = newWalletDoc.data().balance;
          if (newData.type === "expense") newBalance -= newData.amount;
          else newBalance += newData.amount;

          transaction.update(oldWalletRef, { balance: oldBalance });
          transaction.update(newWalletRef, { balance: newBalance });
        }

        transaction.update(txRef, {
          ...newData,
          date: newData.date.getTime(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error: any) {
      throw new Error("Gagal mengupdate: " + error.message);
    }
  },
};
