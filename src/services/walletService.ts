import { db } from "@/src/config/firebase";
import { CreateWalletPayload, Wallet } from "@/src/types/wallet";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const COLLECTION = "wallets";

export const WalletService = {
  createWallet: async (userId: string, data: CreateWalletPayload) => {
    try {
      await addDoc(collection(db, COLLECTION), {
        userId,
        ...data,
        balance: data.initialBalance,
        currency: "IDR",
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      throw new Error("Gagal membuat dompet: " + error.message);
    }
  },

  subscribeWallets: (userId: string, onUpdate: (data: Wallet[]) => void) => {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("isArchived", "==", false),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wallets = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Wallet
      );
      onUpdate(wallets);
    });

    return unsubscribe;
  },
};
