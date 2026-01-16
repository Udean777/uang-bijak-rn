import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { TransactionService } from "@/src/services/transactionService";
import { Transaction } from "@/src/types/transaction";
import { useEffect, useState } from "react";

export interface TransactionSection {
  title: string;
  data: Transaction[];
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = TransactionService.subscribeTransactions(
      user.uid,
      (data) => {
        setTransactions(data);

        const grouped: { [key: string]: Transaction[] } = {};

        data.forEach((item) => {
          const date = new Date(item.date);

          const dateKey = date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(item);
        });

        const sectionsArray = Object.keys(grouped).map((date) => ({
          title: date,
          data: grouped[date],
        }));

        setSections(sectionsArray);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { transactions, sections, isLoading };
};
