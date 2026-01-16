import { db } from "@/src/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const BudgetService = {
  calculateMonthlyNeeds: async (userId: string): Promise<number> => {
    try {
      const q = query(
        collection(db, "subscriptions"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);

      let totalNeeds = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalNeeds += Number(data.cost) || 0;
      });

      return totalNeeds;
    } catch (error) {
      console.error("Error calculating budget:", error);
      return 0;
    }
  },
};
