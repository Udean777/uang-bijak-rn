import { db } from "@/src/config/firebase";
import { TransactionTemplate } from "@/src/types/template";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "../constants/firebaseCollections";

export const TemplateService = {
  addTemplate: async (data: Omit<TransactionTemplate, "id">) => {
    await addDoc(collection(db, COLLECTIONS.TEMPLATES), data);
  },

  deleteTemplate: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.TEMPLATES, id));
  },

  subscribeTemplates: (
    userId: string,
    callback: (list: TransactionTemplate[]) => void,
  ) => {
    const q = query(
      collection(db, COLLECTIONS.TEMPLATES),
      where("userId", "==", userId),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TransactionTemplate[];
        callback(data);
      },
      (error) => {
        console.error("[TemplateService] Snapshot error:", error);
      },
    );
  },
};
