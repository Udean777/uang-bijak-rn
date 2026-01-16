import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { CreateTransactionPayload } from "../types/transaction";

const COLLECTION = "transactions";
const WALLET_COLLECTION = "wallets";

export const TransactionService = {
  addTransaction: async (userId: string, data: CreateTransactionPayload) => {
    try {
      await runTransaction(db, async (transaction) => {
        const newtxRef = doc(collection(db, COLLECTION));
        const walletRef = doc(collection(db, WALLET_COLLECTION, data.walletId));

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
};
