import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { CreateWalletPayload, Wallet } from "../types/wallet";

const COLLECTION = "wallets";

export const WalletService = {
  createWallet: async (
    userId: string,
    data: CreateWalletPayload
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        userId,
        ...data,
        balance: data.initialBalance,
        currency: "IDR",
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error("Gagal membuat dompet: " + error.message);
    }
  },

  subscribeWallets: (userId: string, callback: (wallets: Wallet[]) => void) => {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("isArchived", "==", false),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const wallets: Wallet[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Wallet
      );
      callback(wallets);
    });
  },

  updateWallet: async (walletId: string, data: Partial<Wallet>) => {
    const docRef = doc(db, COLLECTION, walletId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now(),
    });
  },

  archiveWallet: async (walletId: string) => {
    const docRef = doc(db, COLLECTION, walletId);
    await updateDoc(docRef, { isArchived: true });
  },
};
