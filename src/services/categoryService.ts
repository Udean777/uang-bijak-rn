import { db } from "@/src/config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Makan", type: "expense", icon: "fast-food" },
  { id: "2", name: "Transport", type: "expense", icon: "car" },
  { id: "3", name: "Belanja", type: "expense", icon: "cart" },
  { id: "4", name: "Gaji", type: "income", icon: "cash" },
];

export const CategoryService = {
  addCategory: async (
    userId: string,
    name: string,
    type: "income" | "expense",
  ) => {
    await addDoc(collection(db, "categories"), {
      userId,
      name,
      type,
      icon: "pricetag",
      createdAt: Date.now(),
    });
  },

  subscribeCategories: (
    userId: string,
    callback: (cats: Category[]) => void,
  ) => {
    const q = query(
      collection(db, "categories"),
      where("userId", "==", userId),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const customCats = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Category,
        );
        callback([...DEFAULT_CATEGORIES, ...customCats]);
      },
      (error) => {
        console.error("[CategoryService] Snapshot error:", error);
      },
    );
  },

  deleteCategory: async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  },
};
