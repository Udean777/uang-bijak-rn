import { db } from "@/src/config/firebase";
import {
  CreateWalletPayload,
  UpdateWalletPayload,
  Wallet,
} from "@/src/types/wallet";
import { getErrorMessage } from "@/src/utils/errorUtils";
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
import { COLLECTIONS } from "../constants/firebaseCollections";
import { MESSAGES } from "../constants/messages";
import { stripUndefined } from "../utils/firestoreUtils";

export const WalletService = {
  createWallet: async (userId: string, data: CreateWalletPayload) => {
    try {
      await addDoc(collection(db, COLLECTIONS.WALLETS), {
        userId,
        ...data,
        balance: data.initialBalance,
        currency: "IDR",
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error: unknown) {
      throw new Error(MESSAGES.WALLET.CREATE_FAILED + getErrorMessage(error));
    }
  },

  subscribeWallets: (userId: string, onUpdate: (data: Wallet[]) => void) => {
    const q = query(
      collection(db, COLLECTIONS.WALLETS),
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

  updateWallet: async (walletId: string, data: UpdateWalletPayload) => {
    try {
      const walletRef = doc(db, COLLECTIONS.WALLETS, walletId);

      await updateDoc(
        walletRef,
        stripUndefined({
          ...data,
          updatedAt: Date.now(),
        }),
      );
    } catch (error: unknown) {
      throw new Error(MESSAGES.WALLET.UPDATE_FAILED + getErrorMessage(error));
    }
  },

  deleteWallet: async (walletId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.WALLETS, walletId));
    } catch (error: unknown) {
      throw new Error(MESSAGES.WALLET.DELETE_FAILED + getErrorMessage(error));
    }
  },
};
