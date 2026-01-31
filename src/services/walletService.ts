import { db } from "@/src/config/firebase";
import { CreateWalletPayload, Wallet } from "@/src/types/wallet";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
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
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const wallets = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Wallet,
        );
        onUpdate(wallets);
      },
      (error) => {
        console.error("[WalletService] Snapshot error:", error);
      },
    );

    return unsubscribe;
  },

  updateWallet: async (
    walletId: string,
    data: Partial<CreateWalletPayload>,
  ) => {
    try {
      const walletRef = doc(db, COLLECTION, walletId);

      await updateDoc(walletRef, {
        ...data,
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      throw new Error("Gagal update dompet: " + error.message);
    }
  },

  deleteWallet: async (walletId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION, walletId));
    } catch (error: any) {
      throw new Error("Gagal hapus dompet: " + error.message);
    }
  },
};
