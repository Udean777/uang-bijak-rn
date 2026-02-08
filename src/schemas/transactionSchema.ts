import { z } from "zod";

export const transactionSchema = z
  .object({
    amount: z
      .number({ message: "Nominal harus berupa angka" })
      .positive("Nominal harus lebih dari 0"),
    walletId: z.string().min(1, "Dompet sumber wajib dipilih"),
    type: z.enum(["income", "expense", "transfer"]),
    category: z.string().optional(),
    targetWalletId: z.string().optional(),
    classification: z.enum(["need", "want"]).nullable().optional(),
    date: z.date(),
    note: z.string().optional(),
  })

  .refine(
    (data) => {
      if (data.type === "transfer") return !!data.targetWalletId;
      return true;
    },
    {
      message: "Dompet tujuan wajib dipilih untuk transfer",
      path: ["targetWalletId"],
    },
  )

  .refine(
    (data) => {
      if (data.type === "transfer")
        return data.walletId !== data.targetWalletId;
      return true;
    },
    {
      message: "Dompet sumber dan tujuan tidak boleh sama",
      path: ["targetWalletId"],
    },
  )

  .refine(
    (data) => {
      if (data.type !== "transfer") return !!data.category;
      return true;
    },
    {
      message: "Kategori wajib dipilih",
      path: ["category"],
    },
  );
