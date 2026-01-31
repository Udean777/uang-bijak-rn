import { cacheDirectory, writeAsStringAsync } from "expo-file-system/legacy";
import { isAvailableAsync, shareAsync } from "expo-sharing";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { Transaction } from "../types/transaction";
import { Wallet } from "../types/wallet";

export const ExportService = {
  /**
   * Export transactions to CSV format
   */
  exportTransactionsToCSV: async (
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<void> => {
    try {
      // Fetch transactions
      let q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
      );

      const snapshot = await getDocs(q);
      let transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      // Filter by date range if provided
      if (startDate) {
        transactions = transactions.filter(
          (t) => t.date >= startDate.getTime(),
        );
      }
      if (endDate) {
        transactions = transactions.filter((t) => t.date <= endDate.getTime());
      }

      // Fetch wallets for wallet names
      const walletsSnapshot = await getDocs(
        query(collection(db, "wallets"), where("userId", "==", userId)),
      );
      const wallets: Record<string, string> = {};
      walletsSnapshot.docs.forEach((doc) => {
        const wallet = doc.data() as Wallet;
        wallets[doc.id] = wallet.name;
      });

      // Generate CSV content
      const headers = [
        "Tanggal",
        "Waktu",
        "Tipe",
        "Kategori",
        "Klasifikasi",
        "Jumlah",
        "Dompet",
        "Catatan",
      ];

      const rows = transactions.map((t) => {
        const date = new Date(t.date);
        return [
          date.toLocaleDateString("id-ID"),
          date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          t.type === "income"
            ? "Pemasukan"
            : t.type === "expense"
              ? "Pengeluaran"
              : "Transfer",
          t.category || "-",
          t.classification || "-",
          t.amount.toString(),
          wallets[t.walletId] || t.walletId,
          (t.note || "").replace(/,/g, ";").replace(/\n/g, " "),
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Add BOM for Excel compatibility with Indonesian characters
      const bom = "\uFEFF";
      const csvWithBom = bom + csvContent;

      // Save to file
      const fileName = `uang-bijak-export-${new Date().toISOString().split("T")[0]}.csv`;
      const filePath = `${cacheDirectory}${fileName}`;

      await writeAsStringAsync(filePath, csvWithBom, {
        encoding: "utf8",
      });

      // Share the file
      const isAvailable = await isAvailableAsync();
      if (isAvailable) {
        await shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Export Transaksi",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        throw new Error("Sharing tidak tersedia di perangkat ini");
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      throw new Error("Gagal export data: " + error.message);
    }
  },

  /**
   * Export monthly summary to CSV
   */
  exportMonthlySummaryToCSV: async (
    userId: string,
    year: number,
    month: number,
  ): Promise<void> => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // Fetch transactions for the month
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
      );

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Transaction)
        .filter(
          (t) => t.date >= startDate.getTime() && t.date <= endDate.getTime(),
        );

      // Calculate summary
      let totalIncome = 0;
      let totalExpense = 0;
      let needsTotal = 0;
      let wantsTotal = 0;
      const categoryTotals: Record<string, number> = {};

      transactions.forEach((t) => {
        if (t.type === "income") {
          totalIncome += t.amount;
        } else if (t.type === "expense") {
          totalExpense += t.amount;
          if (t.classification === "need") {
            needsTotal += t.amount;
          } else if (t.classification === "want") {
            wantsTotal += t.amount;
          }
          categoryTotals[t.category] =
            (categoryTotals[t.category] || 0) + t.amount;
        }
      });

      // Generate summary CSV
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const summaryLines = [
        `Laporan Keuangan - ${monthNames[month - 1]} ${year}`,
        "",
        "RINGKASAN",
        `Total Pemasukan,Rp ${totalIncome.toLocaleString("id-ID")}`,
        `Total Pengeluaran,Rp ${totalExpense.toLocaleString("id-ID")}`,
        `Selisih,Rp ${(totalIncome - totalExpense).toLocaleString("id-ID")}`,
        "",
        "KLASIFIKASI PENGELUARAN",
        `Kebutuhan (Needs),Rp ${needsTotal.toLocaleString("id-ID")}`,
        `Keinginan (Wants),Rp ${wantsTotal.toLocaleString("id-ID")}`,
        "",
        "PENGELUARAN PER KATEGORI",
        ...Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .map(
            ([category, amount]) =>
              `${category},Rp ${amount.toLocaleString("id-ID")}`,
          ),
      ];

      const csvContent = summaryLines.join("\n");
      const bom = "\uFEFF";

      const fileName = `uang-bijak-laporan-${year}-${month.toString().padStart(2, "0")}.csv`;
      const filePath = `${cacheDirectory}${fileName}`;

      await writeAsStringAsync(filePath, bom + csvContent, {
        encoding: "utf8",
      });

      const isAvailable = await isAvailableAsync();
      if (isAvailable) {
        await shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Laporan Bulanan",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        throw new Error("Sharing tidak tersedia");
      }
    } catch (error: any) {
      throw new Error("Gagal export laporan: " + error.message);
    }
  },
};
