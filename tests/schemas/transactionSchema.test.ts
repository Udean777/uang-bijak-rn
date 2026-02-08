import { transactionSchema } from "@/src/schemas/transactionSchema";

describe("Transaction Schema Validation", () => {
  const basePayload = {
    amount: 50000,
    walletId: "wallet-a",
    date: new Date(),
    classification: "need",
  };

  it("should validate valid expense", () => {
    const result = transactionSchema.safeParse({
      ...basePayload,
      type: "expense",
      category: "Food",
    });

    expect(result.success).toBe(true);
  });

  it("should reject expense without category", () => {
    const result = transactionSchema.safeParse({
      ...basePayload,
      type: "expense",
      // category missing
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Kategori wajib dipilih",
      );
    }
  });
  it("should validate valid transfer", () => {
    const result = transactionSchema.safeParse({
      ...basePayload,
      type: "transfer",
      targetWalletId: "wallet-b",
      category: "Transfer", // Optional but often auto-filled
    });

    expect(result.success).toBe(true);
  });

  it("should reject transfer without target wallet", () => {
    const result = transactionSchema.safeParse({
      ...basePayload,
      type: "transfer",
      // targetWalletId missing
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Dompet tujuan wajib dipilih",
      );
    }
  });

  it("should reject transfer to same wallet", () => {
    const result = transactionSchema.safeParse({
      ...basePayload,
      type: "transfer",
      targetWalletId: "wallet-a", // Same as source
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toContain("tidak boleh sama");
    }
  });
});
